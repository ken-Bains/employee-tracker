DROP DATABASE IF EXISTS employees_db;
CREATE DATABASE employees_db;
USE employees_db;

CREATE TABLE department(
    id int AUTO_INCREMENT NOT NULL,
    name varchar(30),
    PRIMARY KEY(id)
);

CREATE TABLE roles(
    id int AUTO_INCREMENT NOT NULL,
    title varchar(30),
    salary decimal(30),
    department_id int,
	PRIMARY KEY(id),
    FOREIGN KEY (department_id) REFERENCES department(id)
);
CREATE TABLE employee(
    id int AUTO_INCREMENT NOT NULL,
    first_name varchar(30),
    last_name varchar(30),
    role_id int,
    PRIMARY KEY (id),
    FOREIGN KEY  (role_id) REFERENCES roles(id)
);

