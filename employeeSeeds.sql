DROP DATABASE IF EXISTS employees_db;
CREATE DATABASE employees_db;
USE employees_db;

CREATE TABLE departments(
    id int AUTO_INCREMENT NOT NULL,
    name varchar(30),
    PRIMARY KEY(id)
);

CREATE TABLE roles(
    id int AUTO_INCREMENT NOT NULL,
    title varchar(30),
    salary decimal(10,2),
    department_id int,
	PRIMARY KEY(id),
    FOREIGN KEY (department_id) REFERENCES departments(id)
);
CREATE TABLE employees(
    id int AUTO_INCREMENT NOT NULL,
    first_name varchar(30),
    last_name varchar(30),
    role_id int,
    PRIMARY KEY (id),
    FOREIGN KEY  (role_id) REFERENCES roles(id)
);

INSERT INTO departments (name)
VALUES
	("poject managment"),
    ("testing team"),
    ("app builders");

INSERT INTO roles(title, salary, department_id)
VALUES
	("engineer", 250000, 3),
    ("manager", 200000, 1),
    ("intern", 50000, 3),
    ("QA", 100000, 2);

INSERT INTO employees(first_name, last_name, role_id)
VALUES
	("Chris", "Smith", 1),
    ("Rachel", "Jones", 3),
    ("Ken", "Bains", 2),
    ("Joe", "McCarthy", 4);