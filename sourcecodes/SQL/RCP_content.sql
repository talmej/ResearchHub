insert into professor(Prof_ID, pname, pemail, ppassword, department) 
values
(1, 'Ratan Dey', 'ratan@nyu.edu', 'rdey8686xnyu', 'Computer Science');

insert into Student(Student_ID, sname, semail, spassword, major)
values
(101, 'Turki Almejhed', 'ta9292@nyu.edu', 'talmej6868xnyu', 'Computer Science');


insert into Project(Proj_ID, projName, ptitle, pstatus, pdescription, Prof_ID)
VALUES
(1001, 'Database Portal', 'Research Collaboration Portal', 'planned',
'Development of a research project collaboration platform', 1);

insert into ProjectMember(Student_ID, Proj_ID, role, joinDate)
values
(101, 1001, 'Student Lead', '2026-06-01');


insert into Milestone(Mstone_ID, mtitle, mduedate, mstatus, mdescription, Proj_ID)
values
(5001, 'Develop ER Diagram', '2026-06-30', 'completed',
'Create initial Entity Relationship diagram including entities, attributes, relationships, cardinalities, and participation constraints for the research collaboration portal',
1001);

insert into Milestone(Mstone_ID, mtitle, mduedate, mstatus, mdescription, Proj_ID)
values
(5002, 'Derive Relational Schema', '2026-07-05', 'completed',
'convert the er diagram into a relational schema by identifying primary keys, foreign keys, and relationship tables',
1001);


insert into Milestone(Mstone_ID, mtitle, mduedate, mstatus, mdescription, Proj_ID)
values
(5003, 'Develop Web Interface', '2026-07-30', 'planned',
'design and implement the frontend pages that allow professors and students to manage projects, milestones, progress reports, and feedback',
1001);


insert into ProgressReport(PR_ID, prtitle, prtext, createdAt, filepath, Mstone_ID, Student_ID)
values
(7001, 'ER Diagram Submission',
'completed the initial ER diagram and verified cardinalities and participation constraints',
'2026-06-25',
'erdiagram.pdf',
5001,
101);


insert into Feedback(Fdbck_ID, fdbckTitle, fdbckText, createdAt, Prof_ID, PR_ID)
values
(9001,
'ER Diagram Feedback',
'Good work, Turki. You are so smart. Your participation constraints and cardinalities are correctly represented',
'2026-06-27',
1,
7001);

