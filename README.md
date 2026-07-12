# Research Collaboration Portal

The Research Collaboration Portal is a full-stack web application built for the NYU Databases-3083 course  project. The purpose of the app is to help professors and students organize research projects in one place. Professors create projects, define milestones, assign students, review student progress reports, and give feedback. Students can view their assigned projects, see other project members, view milestones, submit progress reports, and read professor feedback.
Beyond its academic application, this project has the potential to support mentorship in broader contexts by creating a shared workspace where mentors and mentees can centralize goals, document progress, exchange feedback, and foster long-term collaboration.

## Main User Roles

### Student
Students can:
- Register and log in
- View only projects they are assigned to
- See project title, status, role, joined date, description, and milestones
- View project members grouped by project
- Submit progress reports for project milestones
- Attach a file path or link to a report
- View feedback given by a professor

### Professor
Professors can:
- Register and log in
- View only projects they supervise
- Create projects
- Update project status
- Add students to projects
- Assign student roles such as Assistant, Group Member, Group Lead, or custom role
- Create and update milestones
- View student progress reports for their own projects
- Add/view feedback on progress reports

## Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MySQL using XAMPP/phpMyAdmin
- Database driver: mysql2
- Environment variables: dotenv
- Styling: CSS
- Authentication: Role-based login with hashed passwords
