DROP DATABASE IF EXISTS employeetracker_db;
CREATE DATABASE employeetracker_db;

USE employeetracker_db;

CREATE TABLE department (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name varchar(30) NOT NULL
);

CREATE TABLE role (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title varchar(30) NOT NULL,
    salary decimal NOT NULL,
    department_id INT,
    foreign key (department_id) references department(id)
);

CREATE TABLE employee (
	id INT AUTO_INCREMENT PRIMARY KEY,
    first_name varchar(30) NOT NULL,
    last_name varchar(30) NOT NULL,
    role_id INT,
    manager_id INT,
    foreign key (role_id) references role (id),
    foreign key (manager_id) references employee (id)
);