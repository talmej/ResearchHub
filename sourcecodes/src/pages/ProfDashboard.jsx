import { useEffect, useState } from 'react';

function ProfDashboard({ currentUser, setCurrentUser }) {
  // Main dashboard data
  const [projects, setProjects] = useState([]);
  const [view, setView] = useState('');
  const [students, setStudents] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [reports, setReports] = useState([]);
  const [projectRequests, setProjectRequests] = useState([]);
  const [stats, setStats] = useState(null);

  // Popup and selection state
  const [descriptionProject, setDescriptionProject] = useState(null);
  const [milestoneProject, setMilestoneProject] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportPreview, setReportPreview] = useState(null);
  const [feedbackPreview, setFeedbackPreview] = useState(null);
  const [projectStudentsPreview, setProjectStudentsPreview] = useState(null);
  const [showProjectStats, setShowProjectStats] = useState(false);
  const [projectStatsReports, setProjectStatsReports] = useState([]);
  const [projectListPreview, setProjectListPreview] = useState(null);

  // Form mode state
  const [customRole, setCustomRole] = useState('');
  const [milestoneReturnView, setMilestoneReturnView] = useState('');
  const [milestoneMode, setMilestoneMode] = useState('add');
  const [selectedMilestoneId, setSelectedMilestoneId] = useState('');
  const [projectMode, setProjectMode] = useState('create');
  const [selectedProjectId, setSelectedProjectId] = useState('');

  const [feedbackForm, setFeedbackForm] = useState({
    fdbckTitle: '',
    fdbckText: ''
  });

  const [memberForm, setMemberForm] = useState({
    Student_ID: '',
    Proj_ID: '',
    role: ''
  });

  const [projectForm, setProjectForm] = useState({
    projName: '',
    ptitle: '',
    pstatus: '',
    pdescription: '',
    isPublic: '0'
  });
  
  const [milestoneForm, setMilestoneForm] = useState({
    Proj_ID: '',
    mtitle: '',
    mduedate: '',
    mstatus: '',
    mdescription: ''
  });

  const nameParts = currentUser.name.split(' ');
  const lastName = nameParts[nameParts.length - 1];

  // Professor-specific project loader. This prevents showing all projects.
  const loadProfessorProjects = async () => {
    const res = await fetch(`http://127.0.0.1:5000/api/professors/${currentUser.id}/projects`);
    const data = await res.json();

    setProjects(data);
    return data;
  };

  const loadProfessorStats = async () => {
    const res = await fetch(`http://127.0.0.1:5000/api/professors/${currentUser.id}/project-stats`);
    const data = await res.json();

    setStats(data);
  };

  useEffect(() => {
    loadProfessorStats();
    loadProfessorProjects();
  }, []);

  // Sidebar navigation actions
  const handleViewProjects = async () => {
    await loadProfessorProjects();
    setView('projects');
  };

  const handleShowAddStudent = async () => {
    const res = await fetch('http://127.0.0.1:5000/api/students');
    const data = await res.json();

    setStudents(data);
    setView('addStudent');
  };

  const handleShowProjectForm = async () => {
    await loadProfessorProjects();
    setView('createProject');
  };

  const handleViewReports = async () => {
    const res = await fetch(`http://127.0.0.1:5000/api/professors/${currentUser.id}/progress-reports`);
    const data = await res.json();

    setReports(data);
    setView('reports');
  };

  const handleViewRequests = async () => {
    const res = await fetch(`http://127.0.0.1:5000/api/professors/${currentUser.id}/project-requests`);
    const data = await res.json();

    setProjectRequests(data);
    setView('requests');
  };

  const handleShowProjectStats = async () => {
    const res = await fetch(`http://127.0.0.1:5000/api/professors/${currentUser.id}/progress-reports`);
    const data = await res.json();

    setProjectStatsReports(res.ok ? data : []);
    setShowProjectStats(true);
  };

  // Create a new project or update an existing project status.
  const handleCreateProject = async (e) => {
    e.preventDefault();

    const endpoint = projectMode === 'update'
      ? `http://127.0.0.1:5000/api/projects/${selectedProjectId}/status`
      : 'http://127.0.0.1:5000/api/projects';

    if (projectMode === 'update' && !selectedProjectId) {
      alert('Please select a project to update.');
      return;
    }

    const body = projectMode === 'update'
      ? {
          pstatus: projectForm.pstatus,
          isPublic: projectForm.pstatus === 'Completed'
            ? false
            : projectForm.isPublic === '1'
        }
      : {
          ...projectForm,
          isPublic: projectForm.pstatus === 'Completed'
            ? false
            : projectForm.isPublic === '1',
          Prof_ID: currentUser.id
        };

    const res = await fetch(endpoint, {
      method: projectMode === 'update' ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    alert(data.message);

    if (res.ok) {
      setProjectForm({
        projName: '',
        ptitle: '',
        pstatus: '',
        pdescription: '',
        isPublic: '0'
      });
      setSelectedProjectId('');
      setProjectMode('create');
      await loadProfessorStats();

      setView('');
    }
  };

  const handleUpdateRequest = async (requestId, requestStatus) => {
    const res = await fetch(`http://127.0.0.1:5000/api/project-requests/${requestId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        requestStatus,
        role: 'Group Member'
      })
    });

    const data = await res.json();
    alert(data.message);

    if (res.ok) {
      await handleViewRequests();
      await loadProfessorProjects();
    }
  };

  // Add a student to a selected project with a project role.
  const handleAddStudent = async (e) => {
    e.preventDefault();

    const res = await fetch('http://127.0.0.1:5000/api/project-members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...memberForm,
          role: memberForm.role === 'Other' ? customRole : memberForm.role
        })
      });

    const data = await res.json();
    alert(data.message);

    if (res.ok) {
      setMemberForm({
        Student_ID: '',
        Proj_ID: '',
        role: ''
      });

      await handleViewProjects();
    }
  };

  // Keep Back contextual for nested professor views.
  const handleBack = () => {
    if (view === 'addStudent') {
      setView('projects');
    } else if (view === 'addFeedback') {
      setView('reports');
    } else if (view === 'addMilestone') {
      setView(milestoneReturnView);
    } else {
      setView('');
    }
  };

  // Load milestones when a professor selects a project in the milestone form.
  const handleSelectMilestoneProject = async (projectId) => {
    setSelectedMilestoneId('');
    setMilestoneForm({
      ...milestoneForm,
      Proj_ID: projectId,
      mtitle: '',
      mduedate: '',
      mstatus: '',
      mdescription: ''
    });

    if (!projectId) {
      setMilestones([]);
      return;
    }

    const res = await fetch(`http://127.0.0.1:5000/api/projects/${projectId}/milestones`);
    const data = await res.json();

    setMilestones(data);
  };

  // Fill the milestone form when updating an existing milestone.
  const handleSelectMilestoneToUpdate = (milestoneId) => {
    setSelectedMilestoneId(milestoneId);

    const selectedMilestone = milestones.find(
      (milestone) => String(milestone.Mstone_ID) === milestoneId
    );

    if (!selectedMilestone) return;

    const dueDate = selectedMilestone.mduedate
      ? new Date(selectedMilestone.mduedate).toISOString().slice(0, 10)
      : '';

    setMilestoneForm({
      Proj_ID: milestoneForm.Proj_ID,
      mtitle: selectedMilestone.mtitle,
      mduedate: dueDate,
      mstatus: selectedMilestone.mstatus,
      mdescription: selectedMilestone.mdescription || ''
    });
  };

  // MySQL accepts YYYY-MM-DD directly from the browser date input.
  const formatDateForDatabase = (dateValue) => {
    if (!dateValue) return '';

    dateValue = dateValue.trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      return dateValue;
    }

    const match = dateValue.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);

    if (!match) {
      return '';
    }

    const [, month, day, year] = match;
    const parsedDate = new Date(Number(year), Number(month) - 1, Number(day));

    if (
      parsedDate.getFullYear() !== Number(year) ||
      parsedDate.getMonth() !== Number(month) - 1 ||
      parsedDate.getDate() !== Number(day)
    ) {
      return '';
    }

    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  // Add or update milestone depending on the selected milestone mode.
  const handleAddMilestone = async (e) => {
    e.preventDefault();

    if (milestoneMode === 'update' && !selectedMilestoneId) {
      alert('Please select a milestone to update.');
      return;
    }

    const endpoint = milestoneMode === 'update'
      ? `http://127.0.0.1:5000/api/milestones/${selectedMilestoneId}`
      : 'http://127.0.0.1:5000/api/milestones';

    const formattedDueDate = formatDateForDatabase(milestoneForm.mduedate);

    if (!formattedDueDate) {
      alert('Please select a due date.');
      return;
    }

    const res = await fetch(endpoint, {
      method: milestoneMode === 'update' ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...milestoneForm,
        mduedate: formattedDueDate
      })
    });
  
    const data = await res.json();
    alert(data.message);
  
    if (res.ok) {
      setMilestoneForm({
        Proj_ID: '',
        mtitle: '',
        mduedate: '',
        mstatus: '',
        mdescription: ''
      });
      setSelectedMilestoneId('');
      setMilestones([]);
      setMilestoneMode('add');
  
      setView(milestoneReturnView);
    }
  };

  // Save feedback for a student's submitted progress report.
  const handleAddFeedback = async (e) => {
    e.preventDefault();

    const res = await fetch('http://127.0.0.1:5000/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...feedbackForm,
        Prof_ID: currentUser.id,
        PR_ID: selectedReport.PR_ID
      })
    });

    const data = await res.json();
    alert(data.message);

    if (res.ok) {
      setFeedbackForm({
        fdbckTitle: '',
        fdbckText: ''
      });
      setSelectedReport(null);
      await handleViewReports();
    }
  };

  // Popup view for project milestones.
  const handleViewMilestones = async (project) => {
    const res = await fetch(`http://127.0.0.1:5000/api/projects/${project.Proj_ID}/milestones`);
    const data = await res.json();
  
    setMilestones(data);
    setMilestoneProject(project);
  };

  const getInitials = (name) => {
    if (!name) return '?';

    return name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  // Build a unique student list from the professor's already-loaded projects.
  const assignedStudents = Array.from(
    projects.reduce((studentMap, project) => {
      const names = project.studentNames ? project.studentNames.split(', ') : [];
      const roles = project.studentRoles ? project.studentRoles.split(', ') : [];

      names.forEach((name, index) => {
        const existingStudent = studentMap.get(name) || {
          name,
          roles: new Set(),
          projects: new Set()
        };

        if (roles[index]) existingStudent.roles.add(roles[index]);
        existingStudent.projects.add(project.projName);
        studentMap.set(name, existingStudent);
      });

      return studentMap;
    }, new Map()).values()
  ).sort((a, b) => a.name.localeCompare(b.name));

  const studentProjectCounts = new Map(
    assignedStudents.map((student) => [student.name, student.projects.size])
  );

  const totalProjects = Number(stats?.totalProjects || 0);
  const activeProjects = Number(stats?.activeProjects || 0);
  const plannedProjects = Number(stats?.plannedProjects || 0);
  const completedProjects = Number(stats?.completedProjects || 0);
  const chartTotal = totalProjects || 1;
  const activeEnd = (activeProjects / chartTotal) * 100;
  const plannedEnd = activeEnd + (plannedProjects / chartTotal) * 100;
  const completedEnd = plannedEnd + (completedProjects / chartTotal) * 100;
  const multiProjectStudents = assignedStudents.filter(
    (student) => student.projects.size > 1
  ).length;
  const activeStudentNames = new Set(
    projects
      .filter((project) => project.pstatus === 'Active' && project.studentNames)
      .flatMap((project) => project.studentNames.split(', '))
  );
  const projectsByStatus = (status) => projects.filter(
    (project) => project.pstatus === status
  );
  const projectsByVisibility = (isPublic) => projects.filter((project) => isPublic
    ? project.pstatus !== 'Completed' && Boolean(project.isPublic)
    : project.pstatus === 'Completed' || !Boolean(project.isPublic));
  const projectPreviewText = (projectList) => {
    if (projectList.length === 0) return 'No projects';

    const visibleNames = projectList.slice(0, 2).map((project) => project.projName);
    return projectList.length > 3
      ? `${visibleNames.join(', ')}, ... (click to view all)`
      : projectList.map((project) => project.projName).join(', ');
  };
  const openProjectList = (label, projectList) => {
    if (projectList.length > 3) {
      setProjectListPreview({ label, projects: projectList });
    }
  };

  return (
    <div className="dashboard dashboard-shell professor-dashboard has-right-sidebar">
      <aside className="dashboard-sidebar">
        <div>
          <p>{currentUser.name} (professor)</p>
          <h2>ResearchHub</h2>
        </div>

        <nav className="sidebar-nav">
          <button onClick={handleViewProjects}>View Projects</button>
          <button onClick={handleViewReports}>View Student Reports</button>
          <button onClick={handleShowProjectForm}>Create / Update Project</button>
          <button onClick={handleViewRequests}>Project Requests</button>
        </nav>

        <section className="professor-sidebar-stats" aria-label="Professor dashboard statistics">
          <button
            type="button"
            className="sidebar-stats-title"
            onClick={handleShowProjectStats}
          >
            Project Stats
          </button>

          <div className="sidebar-project-numbers">
            <span className="active"><strong>{activeProjects}</strong>Active</span>
            <span className="planned"><strong>{plannedProjects}</strong>Planned</span>
            <span className="completed"><strong>{completedProjects}</strong>Completed</span>
          </div>

          <div
            className="project-stats-donut"
            style={{
              '--active-end': `${activeEnd}%`,
              '--planned-end': `${plannedEnd}%`,
              '--completed-end': `${completedEnd}%`
            }}
          >
            <div>
              <strong>{totalProjects}</strong>
              <span>Projects</span>
            </div>
          </div>

          <div className="sidebar-student-stats">
            <h3>Student Stats</h3>
            <div><span>Assigned Students</span><strong>{assignedStudents.length}</strong></div>
            <div><span>On Active Projects</span><strong>{activeStudentNames.size}</strong></div>
            <div><span>Multi-Project</span><strong>{multiProjectStudents}</strong></div>
          </div>
        </section>

        <button className="sidebar-logout" onClick={() => setCurrentUser(null)}>
          Log Out
        </button>
      </aside>

      <main className="dashboard-content">
      {/* Professor dashboard home */}
      {!view && (
        <>
          {stats && (
            <div className="dashboard-stats-stack">
              <div className="stats-grid dashboard-home-stats stats-top-row">
                <div
                  className={`stat-card stats-tooltip ${projects.length > 3 ? 'clickable-stat-card' : ''}`}
                  data-tooltip={projectPreviewText(projects)}
                  onClick={() => openProjectList('All Projects', projects)}
                >
                  <span>Total Projects</span>
                  <strong>{stats.totalProjects || 0}</strong>
                </div>

                <div
                  className={`stat-card stats-tooltip ${projectsByVisibility(true).length > 3 ? 'clickable-stat-card' : ''}`}
                  data-tooltip={projectPreviewText(projectsByVisibility(true))}
                  onClick={() => openProjectList('Public Projects', projectsByVisibility(true))}
                >
                  <span>Public</span>
                  <strong>{stats.publicProjects || 0}</strong>
                </div>

                <div
                  className={`stat-card stats-tooltip ${projectsByVisibility(false).length > 3 ? 'clickable-stat-card' : ''}`}
                  data-tooltip={projectPreviewText(projectsByVisibility(false))}
                  onClick={() => openProjectList('Private Projects', projectsByVisibility(false))}
                >
                  <span>Private</span>
                  <strong>{stats.privateProjects || 0}</strong>
                </div>
              </div>

              <div className="stats-grid dashboard-home-stats stats-status-row">
                <div
                  className={`stat-card stat-active stats-tooltip ${projectsByStatus('Active').length > 3 ? 'clickable-stat-card' : ''}`}
                  data-tooltip={projectPreviewText(projectsByStatus('Active'))}
                  onClick={() => openProjectList('Active Projects', projectsByStatus('Active'))}
                >
                  <span>Active</span>
                  <strong>{stats.activeProjects || 0}</strong>
                </div>

                <div
                  className={`stat-card stat-planned stats-tooltip ${projectsByStatus('Planned').length > 3 ? 'clickable-stat-card' : ''}`}
                  data-tooltip={projectPreviewText(projectsByStatus('Planned'))}
                  onClick={() => openProjectList('Planned Projects', projectsByStatus('Planned'))}
                >
                  <span>Planned</span>
                  <strong>{stats.plannedProjects || 0}</strong>
                </div>

                <div
                  className={`stat-card stat-completed stats-tooltip ${projectsByStatus('Completed').length > 3 ? 'clickable-stat-card' : ''}`}
                  data-tooltip={projectPreviewText(projectsByStatus('Completed'))}
                  onClick={() => openProjectList('Completed Projects', projectsByStatus('Completed'))}
                >
                  <span>Completed</span>
                  <strong>{stats.completedProjects || 0}</strong>
                </div>
              </div>
            </div>
          )}

          <h1>Welcome, Professor {lastName}</h1>
          <p className="dashboard-subtitle">What's on your mind?</p>
        </>
      )}

        {/* Project table action buttons */}
        {view === 'projects' && (
        <div className="prof-main-buttons">
            <button onClick={handleShowAddStudent}>
            + Students
            </button>

            <button
              onClick={() => {
                setMilestoneReturnView('projects');
                setView('addMilestone');
              }}
            >
            + Milestones
            </button>
        </div>
        )}

      {/* Professor project table */}
      {view === 'projects' && (
        <div className="dashboard-list">
          <h2>Projects</h2>

          <table className="projects-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Project Name</th>
                <th>Title</th>
                <th>Status</th>
                <th>Visibility</th>
                <th>Students & Roles</th>
                <th>Description</th>
                <th>Milestones</th>
              </tr>
            </thead>

            <tbody>
              {projects.map((project, index) => (
                <tr key={project.Proj_ID}>
                  <td>{index + 1}</td>
                  <td>{project.projName}</td>
                  <td>{project.ptitle}</td>
                  <td>
                    <span className={`project-status-label status-${project.pstatus.toLowerCase()}`}>
                      {project.pstatus}
                    </span>
                  </td>
                  <td>
                    <span className={`project-visibility-label status-${project.pstatus.toLowerCase()}`}>
                      {project.pstatus === 'Completed' ? 'Private' : (project.isPublic ? 'Public' : 'Private')}
                    </span>
                  </td>
                  <td className="project-student-count-cell">
                    <button
                      type="button"
                      className="project-student-count"
                      onClick={() => setProjectStudentsPreview(project)}
                    >
                      {project.studentNames ? project.studentNames.split(', ').length : 0}
                    </button>
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => setDescriptionProject(project)}
                    >
                      View
                    </button>
                  </td>
                  <td>
                    <button
                        type="button"
                        onClick={() => handleViewMilestones(project)}
                    >
                        View
                    </button>
                    </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Professor project request table */}
      {view === 'requests' && (
        <div className="dashboard-list">
          <h2>Project Requests</h2>

          <table className="projects-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Student</th>
                <th>Email</th>
                <th>Major</th>
                <th>Project</th>
                <th>Status</th>
                <th>Requested</th>
                <th>Decision</th>
              </tr>
            </thead>

            <tbody>
              {projectRequests.length === 0 ? (
                <tr>
                  <td colSpan="8">No project requests yet.</td>
                </tr>
              ) : (
                projectRequests.map((request, index) => (
                  <tr key={request.Request_ID}>
                    <td>{index + 1}</td>
                    <td>{request.sname}</td>
                    <td>{request.semail}</td>
                    <td>{request.major}</td>
                    <td>{request.projName}</td>
                    <td>{request.requestStatus}</td>
                    <td>
                      {request.requestDate
                        ? new Date(request.requestDate).toLocaleDateString('en-US')
                        : '-'}
                    </td>
                    <td>
                      {request.requestStatus === 'Pending' ? (
                        <div className="feedback-actions">
                          <button
                            type="button"
                            onClick={() => handleUpdateRequest(request.Request_ID, 'Approved')}
                          >
                            Approve
                          </button>

                          <button
                            type="button"
                            onClick={() => handleUpdateRequest(request.Request_ID, 'Rejected')}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        request.requestStatus
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Student report table */}
      {view === 'reports' && (
        <div className="dashboard-list">
          <h2>Student Reports</h2>

          <table className="projects-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Student</th>
                <th>Project</th>
                <th>Milestone</th>
                <th>Report</th>
                <th>Feedback</th>
              </tr>
            </thead>

            <tbody>
              {reports.length === 0 ? (
                <tr>
                  <td colSpan="6">No student reports yet...</td>
                </tr>
              ) : (
                reports.map((report, index) => (
                  <tr key={report.PR_ID}>
                    <td>{index + 1}</td>
                    <td>{report.studentName}</td>
                    <td>{report.projName}</td>
                    <td>{report.mtitle}</td>
                    <td>
                      <button
                        type="button"
                        className="table-action-button"
                        onClick={() => setReportPreview(report)}
                      >
                        View
                      </button>
                    </td>
                    <td>
                      <div className="feedback-actions">
                        {report.fdbckTitle ? (
                          <>
                            
                            <button
                              type="button"
                              className="table-action-button"
                              onClick={() => setFeedbackPreview(report)}
                            >
                              View
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedReport(report);
                              setFeedbackForm({
                                fdbckTitle: '',
                                fdbckText: ''
                              });
                              setView('addFeedback');
                            }}
                          >
                            Add Feedback
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Report preview popup */}
      {reportPreview && (
        <div className="description-popup">
          <div className="description-box">
            <button
              type="button"
              className="description-close"
              onClick={() => setReportPreview(null)}
            >
              X
            </button>

            <h4>Report Title: {reportPreview.prtitle}</h4>
            <p>
              <strong>Created At:</strong>{' '}
              {new Date(reportPreview.createdAt).toLocaleDateString('en-US')}
            </p>
            <p><strong>Report:</strong> {reportPreview.prtext}</p>

            {reportPreview.filepath && (
              <p className="file-link-text">
                <strong>File:</strong>{' '}
                <a href={reportPreview.filepath} target="_blank" rel="noreferrer">
                  {reportPreview.filepath}
                </a>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Feedback preview popup */}
      {feedbackPreview && (
        <div className="description-popup">
          <div className="description-box">
            <button
              type="button"
              className="description-close"
              onClick={() => setFeedbackPreview(null)}
            >
              X
            </button>

            {feedbackPreview.fdbckTitle ? (
              <>
                <h4>{feedbackPreview.fdbckTitle}</h4>
                <p>
                  <strong>Created At:</strong>{' '}
                  {new Date(feedbackPreview.feedbackCreatedAt).toLocaleDateString('en-US')}
                </p>

                <div className="dashboard-item">
                  <p>{feedbackPreview.fdbckText}</p>
                </div>
              </>
            ) : (
              <p>No feedback created yet.</p>
            )}
          </div>
        </div>
      )}

      {/* Feedback creation form */}
      {view === 'addFeedback' && selectedReport && (
        <form className="dashboard-list" onSubmit={handleAddFeedback}>
          <h2>Add Feedback</h2>

          <div className="dashboard-item">
            <p>
              <strong>Add feedback on:</strong> {selectedReport.studentName} - {selectedReport.projName} - {selectedReport.mtitle}
            </p>
            <p><strong>Report:</strong> {selectedReport.prtitle}</p>
            <p><strong>Report Text:</strong> {selectedReport.prtext}</p>
            {selectedReport.filepath && (
              <p className="file-link-text">
                <strong>File:</strong>{' '}
                <a href={selectedReport.filepath} target="_blank" rel="noreferrer">
                  {selectedReport.filepath}
                </a>
              </p>
            )}
          </div>

          <input
            type="text"
            placeholder="Feedback Title"
            value={feedbackForm.fdbckTitle}
            onChange={(e) =>
              setFeedbackForm({ ...feedbackForm, fdbckTitle: e.target.value })
            }
          />

          <textarea
            placeholder="Feedback Text"
            value={feedbackForm.fdbckText}
            onChange={(e) =>
              setFeedbackForm({ ...feedbackForm, fdbckText: e.target.value })
            }
          />

          <button type="submit">Submit Feedback</button>
        </form>
      )}

      {/* Add student to project form */}
      {view === 'addStudent' && (
        <form className="dashboard-list" onSubmit={handleAddStudent}>
          <h2>Add Student to Project</h2>

          <select
            value={memberForm.Proj_ID}
            onChange={(e) =>
              setMemberForm({ ...memberForm, Proj_ID: e.target.value })
            }
          >
            <option value="">Select Project</option>
            {projects.map((project) => (
              <option key={project.Proj_ID} value={project.Proj_ID}>
                {project.projName}
              </option>
            ))}
          </select>

          <select
            value={memberForm.Student_ID}
            onChange={(e) =>
              setMemberForm({ ...memberForm, Student_ID: e.target.value })
            }
          >
            <option value="">Select Student</option>
            {students.map((student) => (
              <option key={student.Student_ID} value={student.Student_ID}>
                {student.sname} - {student.major}
              </option>
            ))}
          </select>

           <select
            value={memberForm.role}
            onChange={(e) => {
                setMemberForm({ ...memberForm, role: e.target.value });
                setCustomRole('');
            }}
            >
            <option value="">Select Role</option>
            <option value="Assistant">Assistant</option>
            <option value="Group Member">Group Member</option>
            <option value="Group Lead">Group Lead</option>
            <option value="Other">Other</option>
            </select>

            {memberForm.role === 'Other' && (
            <input
                type="text"
                placeholder="Enter custom role"
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
            />
            )}

          <button type="submit">Add Student</button>
        </form>
      )}

      {/* Create project / update project status form */}
      {view === 'createProject' && (
        <form className="dashboard-list" onSubmit={handleCreateProject}>
          <h2>{projectMode === 'create' ? 'Create Project' : 'Update Project Status'}</h2>

          <select
            value={projectMode}
            onChange={(e) => {
              setProjectMode(e.target.value);
              setSelectedProjectId('');
              setProjectForm({
                projName: '',
                ptitle: '',
                pstatus: '',
                pdescription: '',
                isPublic: '0'
              });
            }}
          >
            <option value="create">Create Project</option>
            <option value="update">Update Project Status</option>
          </select>

          {projectMode === 'update' && (
            <select
              value={selectedProjectId}
              onChange={(e) => {
                const projectId = e.target.value;
                const selectedProject = projects.find(
                  (project) => String(project.Proj_ID) === projectId
                );

                setSelectedProjectId(projectId);
                setProjectForm({
                  projName: selectedProject?.projName || '',
                  ptitle: selectedProject?.ptitle || '',
                  pstatus: selectedProject?.pstatus || '',
                  pdescription: selectedProject?.pdescription || '',
                  isPublic: selectedProject?.isPublic ? '1' : '0'
                });
              }}
            >
              <option value="">Select Project</option>
              {projects.map((project) => (
                <option key={project.Proj_ID} value={project.Proj_ID}>
                  {project.projName}
                </option>
              ))}
            </select>
          )}

          {projectMode === 'create' && (
            <>
              <input
                type="text"
                placeholder="Project Name"
                value={projectForm.projName}
                onChange={(e) =>
                  setProjectForm({ ...projectForm, projName: e.target.value })
                }
              />

              <input
                type="text"
                placeholder="Project Title"
                value={projectForm.ptitle}
                onChange={(e) =>
                  setProjectForm({ ...projectForm, ptitle: e.target.value })
                }
              />
            </>
          )}

          <select
            value={projectForm.pstatus}
            onChange={(e) => {
              const status = e.target.value;
              setProjectForm({
                ...projectForm,
                pstatus: status,
                isPublic: status === 'Completed' ? '0' : projectForm.isPublic
              });
            }}
          >
            <option value="">Select Status</option>
            <option value="Planned">Planned</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
          </select>

          <select
            value={projectForm.isPublic}
            onChange={(e) =>
              setProjectForm({ ...projectForm, isPublic: e.target.value })
            }
            disabled={projectForm.pstatus === 'Completed'}
          >
            <option value="0">Private</option>
            <option value="1">Public</option>
          </select>

          {projectMode === 'create' && (
            <textarea
              placeholder="Project Description"
              value={projectForm.pdescription}
              onChange={(e) =>
                setProjectForm({ ...projectForm, pdescription: e.target.value })
              }
            />
          )}

          <button type="submit">
            {projectMode === 'create' ? 'Create Project' : 'Update Project Status'}
          </button>
        </form>
      )}

      {/* Project description popup */}
      {descriptionProject && (
        <div className="description-popup">
          <div className="description-box">
            <button
              type="button"
              className="description-close"
              onClick={() => setDescriptionProject(null)}
            >
              X
            </button>

            <h2>{descriptionProject.projName}</h2>
            <p>{descriptionProject.pdescription}</p>
          </div>
        </div>
      )}

      {/* Compact student and role list for a project */}
      {projectStudentsPreview && (
        <div className="description-popup">
          <div className="description-box project-students-popup">
            <button
              type="button"
              className="description-close"
              onClick={() => setProjectStudentsPreview(null)}
            >
              X
            </button>

            <h3>{projectStudentsPreview.projName}</h3>
            {projectStudentsPreview.studentNames ? (
              <ul>
                {projectStudentsPreview.studentNames.split(', ').map((name, index) => {
                  const roles = projectStudentsPreview.studentRoles
                    ? projectStudentsPreview.studentRoles.split(', ')
                    : [];

                  return (
                    <li key={`${name}-${index}`}>
                      <strong>{name}</strong>
                      <span>{roles[index] || 'Member'}</span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="empty-note">No students enrolled.</p>
            )}
          </div>
        </div>
      )}

      {/* Milestone list popup */}
      {milestoneProject && (
        <div className="description-popup">
            <div className="description-box">
            <button
                type="button"
                className="description-close"
                onClick={() => {
                setMilestoneProject(null);
                setMilestones([]);
                }}
            >
                X
            </button>

            <h2>{milestoneProject.projName} Milestones</h2>

            {milestones.length === 0 ? (
                <p>No milestones yet.</p>
            ) : (
                <ul>
                {milestones.map((milestone) => (
                    <li key={milestone.Mstone_ID}>
                    <strong>{milestone.mtitle}</strong>
                    <br />
                    Due: {new Date(milestone.mduedate).toLocaleDateString()}
                    <br />
                    Status: {milestone.mstatus}
                    <br />
                    {milestone.mdescription}
                    </li>
                ))}
                </ul>
            )}
            </div>
        </div>
        )}


        {/* Add / update milestone form */}
        {view === 'addMilestone' && (
    <form className="dashboard-list" onSubmit={handleAddMilestone}>
        <h2>{milestoneMode === 'add' ? 'Add Milestone' : 'Update Milestone'}</h2>

        <select
        value={milestoneMode}
        onChange={(e) => {
            setMilestoneMode(e.target.value);
            setSelectedMilestoneId('');
            setMilestones([]);
            setMilestoneForm({
            Proj_ID: '',
            mtitle: '',
            mduedate: '',
            mstatus: '',
            mdescription: ''
            });
        }}
        >
        <option value="add">Add New Milestone</option>
        <option value="update">Update Existing Milestone</option>
        </select>

        <select
        value={milestoneForm.Proj_ID}
        onChange={(e) => handleSelectMilestoneProject(e.target.value)}
        >
        <option value="">Select Project</option>
        {projects.map((project) => (
            <option key={project.Proj_ID} value={project.Proj_ID}>
            {project.projName}
            </option>
        ))}
        </select>

        {milestoneMode === 'update' && (
        <select
            value={selectedMilestoneId}
            onChange={(e) => handleSelectMilestoneToUpdate(e.target.value)}
            disabled={!milestoneForm.Proj_ID}
        >
            <option value="">Select Milestone</option>
            {milestones.map((milestone) => (
            <option key={milestone.Mstone_ID} value={milestone.Mstone_ID}>
                {milestone.mtitle}
            </option>
            ))}
        </select>
        )}

        <input
        type="text"
        placeholder="Milestone Title"
        value={milestoneForm.mtitle}
        onChange={(e) =>
            setMilestoneForm({ ...milestoneForm, mtitle: e.target.value })
        }
        />

        <input
        type="date"
        value={milestoneForm.mduedate}
        onChange={(e) =>
            setMilestoneForm({ ...milestoneForm, mduedate: e.target.value })
        }
        />

        <select
        value={milestoneForm.mstatus}
        onChange={(e) =>
            setMilestoneForm({ ...milestoneForm, mstatus: e.target.value })
        }
        >
        <option value="">Select/Update Status</option>
        <option value="Planned">Planned</option>
        <option value="Active">Active</option>
        <option value="Completed">Completed</option>
        </select>

        <textarea
        placeholder="Milestone Description"
        value={milestoneForm.mdescription}
        onChange={(e) =>
            setMilestoneForm({ ...milestoneForm, mdescription: e.target.value })
        }
        />

        <button type="submit">
        {milestoneMode === 'add' ? 'Add Milestone' : 'Update Milestone'}
        </button>
    </form>
    )}

        {/* In-page back button */}
        {view && (
          <div className="bottom-left-buttons">
            <button onClick={handleBack}>
            Back
            </button>
          </div>
        )}
      </main>

      {projectListPreview && (
        <div className="description-popup">
          <div className="description-box stat-project-list-popup">
            <button
              type="button"
              className="description-close"
              onClick={() => setProjectListPreview(null)}
            >
              X
            </button>

            <h3>{projectListPreview.label}</h3>
            <div className="stat-project-list-heading">
              <span>Project</span>
              <span>Students</span>
            </div>
            <ul>
              {projectListPreview.projects.map((project) => (
                <li key={project.Proj_ID}>
                  <span>{project.projName}</span>
                  <strong>
                    {project.studentNames ? project.studentNames.split(', ').length : 0}
                  </strong>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {showProjectStats && (
        <div className="description-popup">
          <div className="description-box detailed-project-stats-popup">
            <button
              type="button"
              className="description-close"
              onClick={() => setShowProjectStats(false)}
            >
              X
            </button>

            <div className="detailed-stats-heading">
              <div>
                <p>Portfolio Overview</p>
                <h2>Project Statistics</h2>
              </div>
              <strong>{projectStatsReports.length} reports submitted</strong>
            </div>

            <div className="detailed-project-grid">
              {projects.map((project) => {
                const names = project.studentNames ? project.studentNames.split(', ') : [];
                const roles = project.studentRoles ? project.studentRoles.split(', ') : [];
                const projectReports = projectStatsReports.filter(
                  (report) => report.projName === project.projName
                );
                const pendingFeedback = projectReports.filter(
                  (report) => !report.fdbckTitle
                ).length;
                const reportingStudents = new Set(
                  projectReports.map((report) => report.studentName)
                ).size;

                return (
                  <article className="detailed-project-card" key={project.Proj_ID}>
                    <header>
                      <div>
                        <h3>{project.projName}</h3>
                        <span>{project.pstatus} · {project.pstatus === 'Completed' ? 'Private' : (project.isPublic ? 'Public' : 'Private')}</span>
                      </div>
                      <strong>{projectReports.length} reports</strong>
                    </header>

                    <div className="project-report-summary">
                      <span>{names.length} members</span>
                      <span>{reportingStudents}/{names.length} submitted</span>
                      <span>{pendingFeedback} pending feedback</span>
                    </div>

                    {names.length === 0 ? (
                      <p className="empty-note">No students assigned.</p>
                    ) : (
                      <ul>
                        {names.map((name, index) => {
                          const memberReports = projectReports.filter(
                            (report) => report.studentName === name
                          );

                          return (
                            <li key={`${project.Proj_ID}-${name}`}>
                              <div>
                                <strong>{name}</strong>
                                <span>{roles[index] || 'Member'}</span>
                              </div>
                              <b className={memberReports.length ? 'has-reports' : ''}>
                                {memberReports.length} {memberReports.length === 1 ? 'report' : 'reports'}
                              </b>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Permanent professor student sidebar */}
      <aside className="right-dashboard-sidebar">
        <h2>Your Students</h2>

        <div className="student-project-legend" aria-label="Student project activity legend">
          <span className="legend-item one-project">1 Project</span>
          <span className="legend-item two-projects">2 Projects</span>
          <span className="legend-item active-student">
            <i aria-hidden="true"></i>
            3+ Projects
          </span>
        </div>

        {assignedStudents.length === 0 ? (
          <p className="empty-note">No students assigned yet.</p>
        ) : (
          <div className="professor-student-projects">
            {projects.filter((project) => project.studentNames).map((project) => {
              const names = project.studentNames.split(', ');
              const roles = project.studentRoles ? project.studentRoles.split(', ') : [];

              return (
                <section className="project-student-group" key={project.Proj_ID}>
                  <h3>{project.projName}</h3>
                  <div className="project-student-list">
                    {names.map((name, index) => (
                      <div
                        className={`teammate-row student-project-level-${Math.min(studentProjectCounts.get(name) || 1, 3)}`}
                        key={`${project.Proj_ID}-${name}`}
                      >
                        <span
                          className={`teammate-initials ${studentProjectCounts.get(name) === 2 ? 'multi-project' : ''} ${studentProjectCounts.get(name) >= 3 ? 'active-student' : ''}`}
                        >
                          {getInitials(name)}
                        </span>
                        <div className="teammate-info">
                          <p>{name}</p>
                          <span>{roles[index] || 'Member'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </aside>
    </div>
  );
}

export default ProfDashboard;
