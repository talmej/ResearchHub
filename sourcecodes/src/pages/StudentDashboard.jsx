import { useEffect, useState } from 'react';

function StudentDashboard({ currentUser, setCurrentUser }) {
  // Main dashboard data
  const [projects, setProjects] = useState([]);
  const [view, setView] = useState('');
  const [milestones, setMilestones] = useState([]);
  const [reports, setReports] = useState([]);

  // Popup state
  const [descriptionProject, setDescriptionProject] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [feedbackPreview, setFeedbackPreview] = useState(null);
  const [linkMessage, setLinkMessage] = useState('');

  // Progress report form state
  const [reportForm, setReportForm] = useState({
    Proj_ID: '',
    Mstone_ID: '',
    prtitle: '',
    prtext: '',
    filepath: ''
  });

  const loadStudentProjects = async () => {
    const res = await fetch(`http://127.0.0.1:5000/api/students/${currentUser.id}/projects`);
    const data = await res.json();

    setProjects(data);
    return data;
  };

  // Load assigned projects for the permanent right sidebar.
  useEffect(() => {
    loadStudentProjects();
  }, []);

  // Load milestones after the student chooses a project for a report.
  const handleSelectReportProject = async (projectId) => {
    setReportForm({
      ...reportForm,
      Proj_ID: projectId,
      Mstone_ID: ''
    });
  
    const res = await fetch(`http://127.0.0.1:5000/api/projects/${projectId}/milestones`);
    const data = await res.json();
  
    setMilestones(data);
  };

  // Student navigation actions
  const handleViewProjects = async () => {
    await loadStudentProjects();
    setView('projects');
  };

  const handleViewReports = async () => {
    await loadStudentProjects();

    const reportRes = await fetch(`http://127.0.0.1:5000/api/students/${currentUser.id}/progress-reports`);
    const reportData = await reportRes.json();
    setReports(reportData);

    setView('reports');
  };

  const handleAddReport = async (e) => {
    e.preventDefault();

    const res = await fetch('http://127.0.0.1:5000/api/progress-reports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...reportForm,
        Student_ID: currentUser.id
      })
    });

    const data = await res.json();
    alert(data.message);

    if (res.ok) {
      setReportForm({
        Proj_ID: '',
        Mstone_ID: '',
        prtitle: '',
        prtext: '',
        filepath: ''
      });

      setMilestones([]);
      await handleViewReports();
    }
  };

  // Back returns from Add Report to Reports, otherwise to dashboard home.
  const handleBack = () => {
    if (view === 'addReport') {
      setView('reports');
    } else {
      setView('');
    }
  };

  // Link helper prevents a broken report link from navigating away.
  const getReportLinkHref = (filepath) => {
    try {
      return new URL(filepath).href;
    } catch (err) {
      return '#';
    }
  };

  const handleOpenReportLink = (e) => {
    setLinkMessage('');

    try {
      new URL(selectedReport.filepath);
    } catch (err) {
      e.preventDefault();
      setLinkMessage('Link trouble. Please verify the file link is valid.');
    }
  };

  // Description popup also includes milestones for project context.
  const handleViewProjectDetails = async (project) => {
    setDescriptionProject(project);
    setMilestones([]);

    const res = await fetch(`http://127.0.0.1:5000/api/projects/${project.Proj_ID}/milestones`);
    const data = await res.json();

    setMilestones(data);
  };

  // Convert backend teammate string into rows for the right sidebar.
  const parseTeammates = (teammates) => {
    if (!teammates) return [];

    return teammates.split('||').map((member) => {
      const [name, role] = member.split('::');
      return { name, role };
    });
  };

  // Initials for teammate badges.
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

  return (
    <div className="dashboard dashboard-shell student-dashboard has-right-sidebar">
      <aside className="dashboard-sidebar">
        <div>
          <h2>Research Portal</h2>
          <p>{currentUser.name}</p>
        </div>

        <nav className="sidebar-nav">
          <button onClick={handleViewProjects}>View Projects</button>
          <button onClick={handleViewReports}>Progress Reports</button>
        </nav>

        <button className="sidebar-logout" onClick={() => setCurrentUser(null)}>
          Log Out
        </button>
      </aside>

      <main className="dashboard-content">
      {/* Student dashboard home */}
      {!view && (
        <>
          <h1>Hey, {currentUser.name}</h1>
          <p className="dashboard-subtitle">What's on your mind?</p>
        </>
      )}

      {/* Reports action bar */}
      {view === 'reports' && (
        <div className="prof-main-buttons">
          <button onClick={() => setView('addReport')}>
            + Add Progress Report
          </button>
        </div>
      )}

      {/* Assigned projects table */}
      {view === 'projects' && (
          <div className="dashboard-list">
            <h2>My Projects</h2>

            <table className="projects-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Project Name</th>
                  <th>Title</th>
                  <th>Status</th>
                  <th>My Role</th>
                  <th>Joined</th>
                  <th>Description</th>
                </tr>
              </thead>

              <tbody>
                {projects.map((project, index) => (
                  <tr key={project.Proj_ID}>
                    <td>{index + 1}</td>
                    <td>{project.projName}</td>
                    <td>{project.ptitle}</td>
                    <td>{project.pstatus}</td>
                    <td>{project.role}</td>
                    <td>
                      {project.joinDate
                        ? new Date(project.joinDate).toLocaleDateString('en-US')
                        : '-'}
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleViewProjectDetails(project)}
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

      {/* Student progress report table */}
      {view === 'reports' && (
        <div className="dashboard-list">
          <h2>Progress Reports</h2>

          <table className="projects-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Project</th>
                <th>Milestone</th>
                <th>Created At</th>
                <th>File</th>
                <th>Feedback</th>
              </tr>
            </thead>

            <tbody>
              {reports.length === 0 ? (
                <tr>
                  <td colSpan="7">No progress reports yet...</td>
                </tr>
              ) : (
                reports.map((report, index) => (
                  <tr key={report.PR_ID}>
                    <td>{index + 1}</td>
                    <td>{report.prtitle}</td>
                    <td>{report.projName}</td>
                    <td>{report.mtitle}</td>
                    <td>{new Date(report.createdAt).toLocaleDateString('en-US')}</td>
                    <td>
                      {report.filepath ? (
                        <button
                          type="button"
                          onClick={() => setSelectedReport(report)}
                        >
                          Open
                        </button>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => setFeedbackPreview(report)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

    {/* Progress report creation form */}
    {view === 'addReport' && (
      <form className="dashboard-list" onSubmit={handleAddReport}>
        <h2>Add Progress Report</h2>

        <select
          value={reportForm.Proj_ID}
          onChange={(e) => handleSelectReportProject(e.target.value)}
        >
          <option value="">Select Project</option>
          {projects.map((project) => (
            <option key={project.Proj_ID} value={project.Proj_ID}>
              {project.projName}
            </option>
          ))}
        </select>

        <select
          value={reportForm.Mstone_ID}
          onChange={(e) =>
            setReportForm({ ...reportForm, Mstone_ID: e.target.value })
          }
          disabled={!reportForm.Proj_ID}
        >
          <option value="">Select Milestone</option>
          {milestones.map((milestone) => (
            <option key={milestone.Mstone_ID} value={milestone.Mstone_ID}>
              {milestone.mtitle}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Report Title"
          value={reportForm.prtitle}
          onChange={(e) =>
            setReportForm({ ...reportForm, prtitle: e.target.value })
          }
        />

        <textarea
          placeholder="Report Text"
          value={reportForm.prtext}
          onChange={(e) =>
            setReportForm({ ...reportForm, prtext: e.target.value })
          }
        />

        <input
          type="text"
          placeholder="File path or link"
          value={reportForm.filepath}
          onChange={(e) =>
            setReportForm({ ...reportForm, filepath: e.target.value })
          }
        />

        <button type="submit">Submit Progress Report</button>
      </form>
    )}

      {/* Project description and milestone popup */}
      {descriptionProject && (
        <div className="description-popup">
          <div className="description-box">
            <button
              type="button"
              className="description-close"
              onClick={() => {
                setDescriptionProject(null);
                setMilestones([]);
              }}
            >
              X
            </button>

            <h2>{descriptionProject.projName}</h2>
            <p>{descriptionProject.pdescription}</p>

            <h3>Milestones</h3>

            {milestones.length === 0 ? (
              <p>No milestones yet.</p>
            ) : (
              <ul>
                {milestones.map((milestone) => (
                  <li key={milestone.Mstone_ID}>
                    <strong>{milestone.mtitle}</strong>
                    <br />
                    Due: {new Date(milestone.mduedate).toLocaleDateString('en-US')}
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

      {/* Uploaded report popup */}
      {selectedReport && (
        <div className="description-popup">
          <div className="description-box">
            <button
              type="button"
              className="description-close"
              onClick={() => {
                setSelectedReport(null);
                setLinkMessage('');
              }}
            >
              X
            </button>

            <h4>Report Title: {selectedReport.prtitle}</h4>

            <p>
              <strong>Report:</strong> {selectedReport.prtext}
            </p>

            {selectedReport.filepath && (
              <p className="file-link-text">
                <strong>File:</strong>{' '}
                <a
                  href={getReportLinkHref(selectedReport.filepath)}
                  target="_blank"
                  rel="noreferrer"
                  onClick={handleOpenReportLink}
                >
                  {selectedReport.filepath}
                </a>
              </p>
            )}

            {linkMessage && <p className="message">{linkMessage}</p>}
          </div>
        </div>
      )}

      {/* Feedback popup */}
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

            <h4>
              Feedback on {feedbackPreview.projName} - {feedbackPreview.mtitle}
            </h4>

            {feedbackPreview.fdbckTitle ? (
              <>
                <p>
                  <strong>Created At:</strong>{' '}
                  {new Date(feedbackPreview.feedbackCreatedAt).toLocaleDateString('en-US')}
                </p>

                <div className="dashboard-item">
                  <p><strong>{feedbackPreview.fdbckTitle}</strong></p>
                  <p>{feedbackPreview.fdbckText}</p>
                </div>
              </>
            ) : (
              <p>No feedback created yet.</p>
            )}
          </div>
        </div>
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

      {/* Permanent project member sidebar */}
      <aside className="right-dashboard-sidebar">
        <h2>Project Members</h2>

        {projects.length === 0 ? (
          <p className="empty-note">No assigned projects yet.</p>
        ) : (
          projects.map((project) => {
            const teammates = parseTeammates(project.teammates);

            return (
              <div className="teammate-group" key={project.Proj_ID}>
                {teammates.length === 0 ? (
                  <p className="empty-note">No members assigned yet.</p>
                ) : (
                  teammates.map((member) => (
                    <div className="teammate-row" key={`${project.Proj_ID}-${member.name}-${member.role}`}>
                      <span className="teammate-initials">{getInitials(member.name)}</span>
                      <div className="teammate-info">
                        <p>{member.name}</p>
                        <span>{member.role || 'Member'}</span>
                        <small>{project.projName}</small>
                      </div>
                    </div>
                  ))
                )}
              </div>
            );
          })
        )}
      </aside>
    </div>
  );


}

export default StudentDashboard;
