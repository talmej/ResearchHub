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
  

## Local Setup and Installation

### 1. Prerequisites

Install the following before running the application:

- [Node.js and npm](https://nodejs.org/en/download)
- [XAMPP with MySQL](https://www.apachefriends.org/download.html)
- [Git](https://git-scm.com/downloads)
- A code editor such as Visual Studio Code

All components run locally. No cloud hosting or external database service is required.

### 2. Clone the Repository

Open a terminal in your preferred directory and run:

```bash
git clone https://github.com/talmej/ResearchHub.git
cd ResearchHub
```

Once cloned, open the created folder in your preferred code editor, such as Visual Studio Code.

### 3. Set Up the MySQL Database

1. Open the XAMPP Control Panel.
2. Start the MySQL and Apache services.
3. Open phpMyAdmin at `http://localhost/phpmyadmin`.
4. Create a new database for ResearchHub.
5. Select the database and open the **Import** tab.
6. Import `SQL/schema.sql` to create the database tables.
7. Import `SQL/seed.sql` to populate the tables with fictional demonstration records.

The database includes eight tables:

- `Professor`
- `Student`
- `Project`
- `ProjectMember`
- `ProjectRequest`
- `Milestone`
- `ProgressReport`
- `Feedback`

The seed data provides sample professors, students, projects, memberships, requests, milestones, reports, and feedback so the application's functionality can be explored without manually creating every record.

**Note:** The seed should be imported once into a newly initialized database. Reimporting it into a populated database may result in duplicate primary-key or unique-key errors.

### 4. Configure the Backend Environment

Navigate to:

```text
sourcecodes/server/
```

Create a `.env` file containing your local MySQL configuration:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=your_database_name
PORT=5000
```

Replace `your_database_name` with the database name created in phpMyAdmin, and update the other settings to match your local MySQL configuration.

The example assumes the default XAMPP MySQL user and an empty local MySQL password. Your setup may differ.

Do not commit `.env` files or real database credentials to the repository.

### 5. Install Backend Dependencies

Open a terminal in the repository and run:

```bash
cd sourcecodes/server
npm install
```

Start the Express server:

```bash
node index.js
```

The backend runs locally on port `5000` by default.

Keep this terminal open while using the application.

### 6. Install Frontend Dependencies

Open a second terminal from the repository root:

```bash
cd sourcecodes
npm install
```

Start the React development server:

```bash
npm run dev
```

Vite will display the local address for the frontend, typically:

```text
http://localhost:5173/
```

Open the displayed address in your browser to access ResearchHub.

**Windows PowerShell note:** If PowerShell blocks npm scripts because of execution-policy restrictions, use:

```powershell
npm.cmd install
npm.cmd run dev
```

### 7. Using the Application

Once MySQL, Express, and React are running:

1. Open the frontend in your browser.
2. Register a professor or student account, or log in using an account defined in `seed.sql`.
3. Explore the role-specific dashboards.
4. Create or browse research projects, manage memberships, track milestones, submit progress reports, and review feedback.

Demo accounts and their initial passwords are defined in the seed file. 

The seeded accounts are intended exclusively for local demonstration and testing.

## Database Design, SQL Queries, and API Functionality

For a more extensive explanation of the application's functionality, database design, SQL operations, and API interactions, refer to **`use_case_queries.pdf`** included in the repository.

This document provides additional context on the supported use cases and explains how database queries and backend operations support the professor and student workflows.

The `SQL` directory also contains:

- **`schema.sql`:** Defines the relational database structure, primary keys, foreign keys, and constraints.
- **`seed.sql`:** Populates the database with sample records for local testing and demonstration.

## Development Notes

ResearchHub was developed as an academic full-stack project to apply relational database design, SQL, backend API development, authentication, and frontend integration in a working application.

The application currently runs entirely in a local development environment using XAMPP, MySQL, Express, and React.

