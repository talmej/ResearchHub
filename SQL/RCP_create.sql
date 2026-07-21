create table Professor (
    Prof_ID int auto_increment,
    pname varchar(50) not null,
    pemail varchar(100) not null unique,
    ppassword varchar(255) not null,
    department varchar(50),

    PRIMARY KEY (Prof_ID)
);

create table Student (
    Student_ID int auto_increment,
    sname varchar(50) not null,
    semail varchar(100) not null unique,
    spassword varchar(255) not null,
    major varchar(50),

    PRIMARY KEY (Student_ID)
);

create table Project (
    Proj_ID int auto_increment,
    projName varchar(200) not null,
    ptitle varchar(200) not null,
    pstatus varchar(50) not null,
    pdescription varchar(1000) not null,
    isPublic tinyint(1) not null default 0,
    Prof_ID int not null,

    PRIMARY KEY (Proj_ID),
    FOREIGN KEY (Prof_ID) REFERENCES Professor(Prof_ID)
);

create table ProjectMember (
    Student_ID int,
    Proj_ID int,
    role varchar(50),
    joinDate date,

    PRIMARY KEY (Student_ID, Proj_ID),
    FOREIGN KEY (Student_ID) REFERENCES Student(Student_ID),
    FOREIGN KEY (Proj_ID) REFERENCES Project(Proj_ID)
);

create table ProjectRequest (
    Request_ID int auto_increment,
    Student_ID int not null,
    Proj_ID int not null,
    requestStatus varchar(50) not null default 'Pending',
    requestDate date not null,

    PRIMARY KEY (Request_ID),
    UNIQUE (Student_ID, Proj_ID),
    FOREIGN KEY (Student_ID) REFERENCES Student(Student_ID),
    FOREIGN KEY (Proj_ID) REFERENCES Project(Proj_ID)
);

create table Milestone (
    Mstone_ID int auto_increment,
    mtitle varchar(200) not null,
    mduedate date not null,
    mstatus varchar(50) not null,
    mdescription varchar(1000),
    Proj_ID int not null,

    PRIMARY KEY (Mstone_ID),
    FOREIGN KEY (Proj_ID) REFERENCES Project(Proj_ID)
);

create table ProgressReport (
    PR_ID int auto_increment,
    prtitle varchar(200) not null,
    prtext varchar(2000) not null,
    createdAt date not null,
    filepath varchar(2048),
    Mstone_ID int not null,
    Student_ID int not null,

    PRIMARY KEY (PR_ID),
    FOREIGN KEY (Mstone_ID) REFERENCES Milestone(Mstone_ID),
    FOREIGN KEY (Student_ID) REFERENCES Student(Student_ID)
);

create table Feedback (
    Fdbck_ID int auto_increment,
    fdbckTitle varchar(200) not null,
    fdbckText varchar(2000) not null,
    createdAt date not null,
    Prof_ID int not null,
    PR_ID int not null,

    PRIMARY KEY (Fdbck_ID),
    UNIQUE (PR_ID),
    FOREIGN KEY (Prof_ID) REFERENCES Professor(Prof_ID),
    FOREIGN KEY (PR_ID) REFERENCES ProgressReport(PR_ID)
);
