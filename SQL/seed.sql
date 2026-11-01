insert into Professor(Prof_ID, pname, pemail, ppassword, department)
values
(1, 'Alex Morgan', 'alex.morgan@example.com', 'ppass1', 'Computer Science'),
(2, 'Sarah Chen', 'sarah.chen@example.com', 'ppass2', 'Computer Science');

insert into Student(Student_ID, sname, semail, spassword, major)
values
(100, 'Jordan Lee', 'jordan.lee@example.com', 'sppass1', 'Computer Science'),
(101, 'Maya Patel', 'maya.patel@example.com', 'sppass2', 'Computer Science'),
(102, 'Ethan Rivera', 'ethan.rivera@example.com', 'sppass3', 'Computer Science');

insert into Project(Proj_ID, projName, ptitle, pstatus, pdescription, isPublic, Prof_ID)
values
(1000, 'ResearchHub', 'Research Collaboration Portal', 'Active',
'A platform for managing research projects, milestones, reports, and feedback', 1, 1),
(1001, 'Cloud Computing', 'Distributed Systems Performance', 'Planned',
'Research on performance and reliability in distributed cloud systems', 0, 2);

insert into ProjectMember(Student_ID, Proj_ID, role, joinDate)
values
(100, 1000, 'Student Lead', '2026-06-01'),
(101, 1000, 'Research Assistant', '2026-06-05'),
(102, 1001, 'Research Assistant', '2026-07-01');

insert into ProjectRequest(Student_ID, Proj_ID, requestStatus, requestDate)
values
(102, 1000, 'Pending', '2026-07-10');

insert into Milestone(Mstone_ID, mtitle, mduedate, mstatus, mdescription, Proj_ID)
values
(5000, 'Develop ER Diagram', '2026-06-30', 'Completed',
'Design the entity relationship diagram', 1000),
(5001, 'Develop Web Interface', '2026-07-30', 'In Progress',
'Implement the frontend and backend interfaces', 1000),
(5002, 'Cloud Architecture Design', '2026-08-15', 'Planned',
'Design the distributed cloud infrastructure', 1001);

insert into ProgressReport(PR_ID, prtitle, prtext, createdAt, filepath, Mstone_ID, Student_ID)
values
(7000, 'ER Diagram Submission',
'Completed the ER diagram and verified relationships and constraints',
'2026-06-25', NULL, 5000, 100);

insert into Feedback(Fdbck_ID, fdbckTitle, fdbckText, createdAt, Prof_ID, PR_ID)
values
(9000, 'ER Diagram Feedback',
'Good work. The relationships and constraints are correctly represented.',
'2026-06-27', 1, 7000);