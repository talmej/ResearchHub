select * from Professor;

select * from Student;

select * from Project;

select projName
from Project
where Proj_ID = 1001;

select sname, projName
from Student natural join ProjectMember natural join Project;