const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const crypto = require('crypto');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Password hashing settings
const HASH_PREFIX = 'pbkdf2';
const HASH_ITERATIONS = 100000;
const HASH_KEY_LENGTH = 64;
const HASH_DIGEST = 'sha512';

const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .pbkdf2Sync(password, salt, HASH_ITERATIONS, HASH_KEY_LENGTH, HASH_DIGEST)
    .toString('hex');

  return `${HASH_PREFIX}$${salt}$${hash}`;
};

const verifyPassword = (password, storedPassword) => {
  if (!storedPassword) return false;

  const parts = storedPassword.split('$');

  if (parts.length !== 3 || parts[0] !== HASH_PREFIX) {
    return password === storedPassword;
  }

  const [, salt, storedHash] = parts;
  const hash = crypto
    .pbkdf2Sync(password, salt, HASH_ITERATIONS, HASH_KEY_LENGTH, HASH_DIGEST)
    .toString('hex');

  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(storedHash));
};

const passwordNeedsHash = (storedPassword) => {
  return !storedPassword || !storedPassword.startsWith(`${HASH_PREFIX}$`);
};

// MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) {
    console.log('database connection failed:', err.message);
    return;
  }

  console.log("You're connected to mysql! Massive W");
});

app.get('/', (req, res) => {
  res.send('backend running');
});

// -----------------------------
// Project routes
// -----------------------------

app.get('/api/projects', (req, res) => {
  const sql = `
    select
      Project.Proj_ID,
      Project.projName,
      Project.ptitle,
      Project.pstatus,
      Project.pdescription,
      Project.isPublic,
      Professor.pname as professorName,
      group_concat(Student.sname separator ', ') as studentNames,
      group_concat(ProjectMember.role separator ', ') as studentRoles
    from Project
    join Professor on Project.Prof_ID = Professor.Prof_ID
    left join ProjectMember on Project.Proj_ID = ProjectMember.Proj_ID
    left join Student on ProjectMember.Student_ID = Student.Student_ID
    group by
      Project.Proj_ID,
      Project.projName,
      Project.ptitle,
      Project.pstatus,
      Project.pdescription,
      Project.isPublic,
      Professor.pname
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// Professor dashboard project list.
app.get('/api/professors/:profId/projects', (req, res) => {
  const { profId } = req.params;

  const sql = `
    select
      Project.Proj_ID,
      Project.projName,
      Project.ptitle,
      Project.pstatus,
      Project.pdescription,
      Project.isPublic,
      group_concat(Student.sname separator ', ') as studentNames,
      group_concat(ProjectMember.role separator ', ') as studentRoles
    from Project
    left join ProjectMember on Project.Proj_ID = ProjectMember.Proj_ID
    left join Student on ProjectMember.Student_ID = Student.Student_ID
    where Project.Prof_ID = ?
    group by
      Project.Proj_ID,
      Project.projName,
      Project.ptitle,
      Project.pstatus,
      Project.pdescription,
      Project.isPublic
  `;

  db.query(sql, [profId], (err, results) => {
    if (err) return res.status(500).json({ message: err.sqlMessage });
    res.json(results);
  });
});

// Public project list for students who want to request to join.
app.get('/api/students/:studentId/public-projects', (req, res) => {
  const { studentId } = req.params;

  const sql = `
    select
      Project.Proj_ID,
      Project.projName,
      Project.ptitle,
      Project.pstatus,
      Project.pdescription,
      Professor.pname as professorName,
      ProjectRequest.requestStatus
    from Project
    join Professor on Project.Prof_ID = Professor.Prof_ID
    left join ProjectMember
      on Project.Proj_ID = ProjectMember.Proj_ID
      and ProjectMember.Student_ID = ?
    left join ProjectRequest
      on Project.Proj_ID = ProjectRequest.Proj_ID
      and ProjectRequest.Student_ID = ?
    where Project.isPublic = 1
      and ProjectMember.Student_ID is null
    order by Project.projName
  `;

  db.query(sql, [studentId, studentId], (err, results) => {
    if (err) return res.status(500).json({ message: err.sqlMessage });
    res.json(results);
  });
});

// Student project stats.
app.get('/api/students/:studentId/project-stats', (req, res) => {
  const { studentId } = req.params;

  const sql = `
    select
      (select count(*) from ProjectMember where Student_ID = ?) as enrolledProjects,
      (select count(*) from ProjectRequest where Student_ID = ? and requestStatus = 'Pending') as pendingRequests,
      sum(case when Project.pstatus = 'Active' then 1 else 0 end) as activeProjects,
      sum(case when Project.pstatus = 'Planned' then 1 else 0 end) as plannedProjects,
      sum(case when Project.pstatus = 'Completed' then 1 else 0 end) as completedProjects
    from ProjectMember
    join Project on ProjectMember.Proj_ID = Project.Proj_ID
    where ProjectMember.Student_ID = ?
  `;

  db.query(sql, [studentId, studentId, studentId], (err, results) => {
    if (err) return res.status(500).json({ message: err.sqlMessage });
    res.json(results[0]);
  });
});

// Professor project stats.
app.get('/api/professors/:profId/project-stats', (req, res) => {
  const { profId } = req.params;

  const sql = `
    select
      count(*) as totalProjects,
      sum(case when isPublic = 1 then 1 else 0 end) as publicProjects,
      sum(case when isPublic = 0 then 1 else 0 end) as privateProjects,
      sum(case when pstatus = 'Active' then 1 else 0 end) as activeProjects,
      sum(case when pstatus = 'Planned' then 1 else 0 end) as plannedProjects,
      sum(case when pstatus = 'Completed' then 1 else 0 end) as completedProjects
    from Project
    where Prof_ID = ?
  `;

  db.query(sql, [profId], (err, results) => {
    if (err) return res.status(500).json({ message: err.sqlMessage });
    res.json(results[0]);
  });
});

// -----------------------------
// Authentication routes
// -----------------------------

app.post('/api/register', (req, res) => {
  const { role, name, email, password, major, department } = req.body;
  const hashedPassword = hashPassword(password);

  if (role === 'student') {
    db.query('select * from Student where semail = ?', [email], (err, results) => {
      if (err) return res.status(500).json(err);

      if (results.length > 0) {
        return res.status(400).json({ message: 'email already exists' });
      }

      db.query(
        'insert into Student(sname, semail, spassword, major) values (?, ?, ?, ?)',
        [name, email, hashedPassword, major],
        (err, results) => {
          if (err) return res.status(500).json(err);

          res.json({
            message: 'Account created successfully!',
            user: {
              id: results.insertId,
              name,
              email,
              role: 'student'
            }
          });
        }
      );
    });
  }

  if (role === 'professor') {
    db.query('select * from Professor where pemail = ?', [email], (err, results) => {
      if (err) return res.status(500).json(err);

      if (results.length > 0) {
        return res.status(400).json({ message: 'email already exists' });
      }

      db.query(
        'insert into Professor(pname, pemail, ppassword, department) values (?, ?, ?, ?)',
        [name, email, hashedPassword, department],
        (err, results) => {
          if (err) return res.status(500).json(err);

          res.json({
            message: 'Account created successfully!',
            user: {
              id: results.insertId,
              name,
              email,
              role: 'professor'
            }
          });
        }
      );
    });
  }
});

app.post('/api/login', (req, res) => {
  const { role, email, password } = req.body;

  if (role === 'student') {
    db.query(
      'select * from Student where semail = ?',
      [email],
      (err, results) => {
        if (err) return res.status(500).json(err);

        if (results.length === 0 || !verifyPassword(password, results[0].spassword)) {
          return res.status(401).json({ message: 'The email or password is invalid' });
        }

        const user = results[0];

        if (passwordNeedsHash(user.spassword)) {
          db.query(
            'update Student set spassword = ? where Student_ID = ?',
            [hashPassword(password), user.Student_ID]
          );
        }

        res.json({
          message: 'login successful!',
          user: {
            id: user.Student_ID,
            name: user.sname,
            email: user.semail,
            role: 'student'
          }
        });
      }
    );
  }

  if (role === 'professor') {
    db.query(
      'select * from Professor where pemail = ?',
      [email],
      (err, results) => {
        if (err) return res.status(500).json(err);

        if (results.length === 0 || !verifyPassword(password, results[0].ppassword)) {
          return res.status(401).json({ message: 'The email or password is invalid' });
        }

        const user = results[0];

        if (passwordNeedsHash(user.ppassword)) {
          db.query(
            'update Professor set ppassword = ? where Prof_ID = ?',
            [hashPassword(password), user.Prof_ID]
          );
        }

        res.json({
          message: 'login successful!',
          user: {
            id: user.Prof_ID,
            name: user.pname,
            email: user.pemail,
            role: 'professor'
          }
        });
      }
    );
  }
});

// Create a new project.
app.post('/api/projects', (req, res) => {
  const { projName, ptitle, pstatus, pdescription, isPublic, Prof_ID } = req.body;

  if (!projName || !ptitle || !pstatus || !pdescription || !Prof_ID) {
    return res.status(400).json({ message: 'missing project information' });
  }

  db.query(
    'insert into Project(projName, ptitle, pstatus, pdescription, isPublic, Prof_ID) values (?, ?, ?, ?, ?, ?)',
    [projName, ptitle, pstatus, pdescription, isPublic ? 1 : 0, Prof_ID],
    (err, results) => {
      if (err) return res.status(500).json(err);

      res.json({
        message: 'project created successfully!',
        projectId: results.insertId
      });
    }
  );
});

// Update the project status and public/private visibility.
app.put('/api/projects/:projectId/status', (req, res) => {
  const { projectId } = req.params;
  const { pstatus, isPublic } = req.body;

  if (!pstatus) {
    return res.status(400).json({ message: 'missing project status' });
  }

  db.query(
    'update Project set pstatus = ?, isPublic = ? where Proj_ID = ?',
    [pstatus, isPublic ? 1 : 0, projectId],
    (err, results) => {
      if (err) return res.status(500).json({ message: err.sqlMessage });

      if (results.affectedRows === 0) {
        return res.status(404).json({ message: 'project not found' });
      }

      res.json({ message: 'project updated successfully!' });
    }
  );
});

// -----------------------------
// Student and project member routes
// -----------------------------

app.get('/api/students', (req, res) => {
  db.query(
    'select Student_ID, sname, semail, major from Student',
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    }
  );
});

// Student dashboard project list.
app.get('/api/students/:studentId/projects', (req, res) => {
  const { studentId } = req.params;

  const sql = `
    select
      Project.Proj_ID,
      Project.projName,
      Project.ptitle,
      Project.pstatus,
      Project.pdescription,
      ProjectMember.role,
      ProjectMember.joinDate,
      (
        select group_concat(concat(Student.sname, '::', ProjectMember.role) separator '||')
        from ProjectMember
        join Student on ProjectMember.Student_ID = Student.Student_ID
        where ProjectMember.Proj_ID = Project.Proj_ID
          and ProjectMember.Student_ID <> ?
      ) as teammates
    from ProjectMember
    join Project on ProjectMember.Proj_ID = Project.Proj_ID
    where ProjectMember.Student_ID = ?
  `;

  db.query(sql, [studentId, studentId], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// Assign a student to a project.
app.post('/api/project-members', (req, res) => {
  const { Student_ID, Proj_ID, role } = req.body;

  if (!Student_ID || !Proj_ID || !role) {
    return res.status(400).json({ message: 'missing project member information' });
  }

  db.query(
    'insert into ProjectMember(Student_ID, Proj_ID, role, joinDate) values (?, ?, ?, CURDATE())',
    [Student_ID, Proj_ID, role],
    (err) => {
      if (err) return res.status(500).json({ message: err.sqlMessage });
      res.json({ message: 'student added to project!' });
    }
  );
});

// Student requests to join a public project.
app.post('/api/project-requests', (req, res) => {
  const { Student_ID, Proj_ID } = req.body;

  if (!Student_ID || !Proj_ID) {
    return res.status(400).json({ message: 'missing request information' });
  }

  db.query(
    `insert into ProjectRequest(Student_ID, Proj_ID, requestStatus, requestDate)
     values (?, ?, 'Pending', CURDATE())
     on duplicate key update requestStatus = 'Pending', requestDate = CURDATE()`,
    [Student_ID, Proj_ID],
    (err) => {
      if (err) return res.status(500).json({ message: err.sqlMessage });
      res.json({ message: 'request sent successfully!' });
    }
  );
});

// Professor sees requests for only their projects.
app.get('/api/professors/:profId/project-requests', (req, res) => {
  const { profId } = req.params;

  const sql = `
    select
      ProjectRequest.Request_ID,
      ProjectRequest.requestStatus,
      ProjectRequest.requestDate,
      Student.Student_ID,
      Student.sname,
      Student.semail,
      Student.major,
      Project.Proj_ID,
      Project.projName,
      Project.ptitle
    from ProjectRequest
    join Student on ProjectRequest.Student_ID = Student.Student_ID
    join Project on ProjectRequest.Proj_ID = Project.Proj_ID
    where Project.Prof_ID = ?
    order by ProjectRequest.requestDate desc
  `;

  db.query(sql, [profId], (err, results) => {
    if (err) return res.status(500).json({ message: err.sqlMessage });
    res.json(results);
  });
});

// Professor approves or rejects a project request.
app.put('/api/project-requests/:requestId', (req, res) => {
  const { requestId } = req.params;
  const { requestStatus, role } = req.body;

  if (!['Approved', 'Rejected'].includes(requestStatus)) {
    return res.status(400).json({ message: 'invalid request status' });
  }

  db.query(
    'select Student_ID, Proj_ID from ProjectRequest where Request_ID = ?',
    [requestId],
    (err, results) => {
      if (err) return res.status(500).json({ message: err.sqlMessage });

      if (results.length === 0) {
        return res.status(404).json({ message: 'request not found' });
      }

      const request = results[0];

      const updateRequest = () => {
        db.query(
          'update ProjectRequest set requestStatus = ? where Request_ID = ?',
          [requestStatus, requestId],
          (err) => {
            if (err) return res.status(500).json({ message: err.sqlMessage });
            res.json({ message: `request ${requestStatus.toLowerCase()} successfully!` });
          }
        );
      };

      if (requestStatus === 'Rejected') {
        updateRequest();
        return;
      }

      db.query(
        'insert ignore into ProjectMember(Student_ID, Proj_ID, role, joinDate) values (?, ?, ?, CURDATE())',
        [request.Student_ID, request.Proj_ID, role || 'Group Member'],
        (err) => {
          if (err) return res.status(500).json({ message: err.sqlMessage });
          updateRequest();
        }
      );
    }
  );
});

// -----------------------------
// Milestone routes
// -----------------------------

app.post('/api/milestones', (req, res) => {
  const { mtitle, mduedate, mstatus, mdescription, Proj_ID } = req.body;

  if (!mtitle || !mduedate || !mstatus || !Proj_ID) {
    return res.status(400).json({ message: 'missing milestone information' });
  }

  db.query(
    'insert into Milestone(mtitle, mduedate, mstatus, mdescription, Proj_ID) values (?, ?, ?, ?, ?)',
    [mtitle, mduedate, mstatus, mdescription, Proj_ID],
    (err, results) => {
      if (err) return res.status(500).json({ message: err.sqlMessage });

      res.json({
        message: 'milestone created successfully!',
        milestoneId: results.insertId
      });
    }
  );
});

app.get('/api/projects/:projectId/milestones', (req, res) => {
  const { projectId } = req.params;

  db.query(
    'select Mstone_ID, mtitle, mduedate, mstatus, mdescription from Milestone where Proj_ID = ?',
    [projectId],
    (err, results) => {
      if (err) return res.status(500).json({ message: err.sqlMessage });
      res.json(results);
    }
  );
});

app.put('/api/milestones/:milestoneId', (req, res) => {
  const { milestoneId } = req.params;
  const { mtitle, mduedate, mstatus, mdescription, Proj_ID } = req.body;

  if (!mtitle || !mduedate || !mstatus || !Proj_ID) {
    return res.status(400).json({ message: 'missing milestone information' });
  }

  db.query(
    'update Milestone set mtitle = ?, mduedate = ?, mstatus = ?, mdescription = ?, Proj_ID = ? where Mstone_ID = ?',
    [mtitle, mduedate, mstatus, mdescription, Proj_ID, milestoneId],
    (err, results) => {
      if (err) return res.status(500).json({ message: err.sqlMessage });

      if (results.affectedRows === 0) {
        return res.status(404).json({ message: 'milestone not found' });
      }

      res.json({ message: 'milestone updated successfully!' });
    }
  );
});

// -----------------------------
// Progress report routes
// -----------------------------

app.post('/api/progress-reports', (req, res) => {
  const { prtitle, prtext, filepath, Mstone_ID, Student_ID } = req.body;

  if (!prtitle || !prtext || !Mstone_ID || !Student_ID) {
    return res.status(400).json({ message: 'missing progress report information' });
  }

  db.query(
    'insert into ProgressReport(prtitle, prtext, createdAt, filepath, Mstone_ID, Student_ID) values (?, ?, CURDATE(), ?, ?, ?)',
    [prtitle, prtext, filepath, Mstone_ID, Student_ID],
    (err, results) => {
      if (err) return res.status(500).json({ message: err.sqlMessage });

      res.json({
        message: 'progress report submitted successfully!',
        reportId: results.insertId
      });
    }
  );
});

// Student view of their own submitted reports.
app.get('/api/students/:studentId/progress-reports', (req, res) => {
  const { studentId } = req.params;

  const sql = `
    select
      ProgressReport.PR_ID,
      ProgressReport.prtitle,
      ProgressReport.prtext,
      ProgressReport.createdAt,
      ProgressReport.filepath,
      Milestone.mtitle,
      Project.projName,
      Feedback.fdbckTitle,
      Feedback.fdbckText,
      Feedback.createdAt as feedbackCreatedAt
    from ProgressReport
    join Milestone on ProgressReport.Mstone_ID = Milestone.Mstone_ID
    join Project on Milestone.Proj_ID = Project.Proj_ID
    left join Feedback on ProgressReport.PR_ID = Feedback.PR_ID
    where ProgressReport.Student_ID = ?
    order by ProgressReport.createdAt desc
  `;

  db.query(sql, [studentId], (err, results) => {
    if (err) return res.status(500).json({ message: err.sqlMessage });
    res.json(results);
  });
});

// General report list route kept for broad project views/testing.
app.get('/api/progress-reports', (req, res) => {
  const sql = `
    select
      ProgressReport.PR_ID,
      ProgressReport.prtitle,
      ProgressReport.prtext,
      ProgressReport.createdAt,
      ProgressReport.filepath,
      Student.sname as studentName,
      Milestone.mtitle,
      Project.projName,
      Feedback.fdbckTitle,
      Feedback.fdbckText,
      Feedback.createdAt as feedbackCreatedAt
    from ProgressReport
    join Student on ProgressReport.Student_ID = Student.Student_ID
    join Milestone on ProgressReport.Mstone_ID = Milestone.Mstone_ID
    join Project on Milestone.Proj_ID = Project.Proj_ID
    left join Feedback on ProgressReport.PR_ID = Feedback.PR_ID
    order by ProgressReport.createdAt desc
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: err.sqlMessage });
    res.json(results);
  });
});

// Professor view of reports for only their projects.
app.get('/api/professors/:profId/progress-reports', (req, res) => {
  const { profId } = req.params;

  const sql = `
    select
      ProgressReport.PR_ID,
      ProgressReport.prtitle,
      ProgressReport.prtext,
      ProgressReport.createdAt,
      ProgressReport.filepath,
      Student.sname as studentName,
      Milestone.mtitle,
      Project.projName,
      Feedback.fdbckTitle,
      Feedback.fdbckText,
      Feedback.createdAt as feedbackCreatedAt
    from ProgressReport
    join Student on ProgressReport.Student_ID = Student.Student_ID
    join Milestone on ProgressReport.Mstone_ID = Milestone.Mstone_ID
    join Project on Milestone.Proj_ID = Project.Proj_ID
    left join Feedback on ProgressReport.PR_ID = Feedback.PR_ID
    where Project.Prof_ID = ?
    order by ProgressReport.createdAt desc
  `;

  db.query(sql, [profId], (err, results) => {
    if (err) return res.status(500).json({ message: err.sqlMessage });
    res.json(results);
  });
});

// -----------------------------
// Feedback routes
// -----------------------------

app.post('/api/feedback', (req, res) => {
  const { fdbckTitle, fdbckText, Prof_ID, PR_ID } = req.body;

  if (!fdbckTitle || !fdbckText || !Prof_ID || !PR_ID) {
    return res.status(400).json({ message: 'missing feedback information' });
  }

  db.query(
    `insert into Feedback(fdbckTitle, fdbckText, createdAt, Prof_ID, PR_ID)
     values (?, ?, CURDATE(), ?, ?)
     on duplicate key update
       fdbckTitle = values(fdbckTitle),
       fdbckText = values(fdbckText),
       createdAt = CURDATE(),
       Prof_ID = values(Prof_ID)`,
    [fdbckTitle, fdbckText, Prof_ID, PR_ID],
    (err, results) => {
      if (err) return res.status(500).json({ message: err.sqlMessage });

      res.json({
        message: 'feedback saved successfully!',
        feedbackId: results.insertId
      });
    }
  );
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
