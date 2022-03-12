// Dependencies
const inquirer = require('inquirer');
const connection = require('./config/connection');
const cTable = require('console.table');
// const consoleTable = require('console-table');

// Connect to database and start promptUser.
connection.connect((error) => {
    if (error) throw error;
    console.log(error);
    promptUser();
});

const promptUser = () => {
    inquirer.prompt([
        {
            name: 'choices',
            type: 'list',
            message: 'Please select from the following options:',
            choices: [
                'View All Departments',
                'View All Roles',
                'View All Employees',
                'View All Employees By Departments',
                'View Total Budget By Departments',
                'Add Department',
                'Add Role',
                'Add Employees',
                'Update Employee Role',
                'Update Employee Manager',
                'Delete Departments',
                'Delete Role',
                'Delete Employees',
                'Exit'
            ]
        }
    ])
        .then((answers) => {
            const { choices } = answers;

            if (choices === 'View All Departments') {
                viewAllDep();
            }

            if (choices === 'View All Roles') {
                viewAllRoles();
            }

            if (choices === 'View All Employees') {
                viewAllEmp();
            }

            if (choices === 'View All Employees By Departments') {
                viewTotalEmp();
            }

            if (choices === 'View Total Budget By Departments') {
                viewTotalBudget();
            }

            if (choices === 'Add Department') {
                addDep();
            }

            if (choices === 'Add Role') {
                addRole();
            }

            if (choices === 'Add Employees') {
                addEmp();
            }

            if (choices === 'Update Employee Role') {
                updateEmpRole();
            }

            if (choices === 'Update Employee Manager') {
                updateEmpManager();
            }

            if (choices === 'Delete Departments') {
                deleteDep();
            }

            if (choices === 'Delete Role') {
                deleteRole();
            }

            if (choices === 'Delete Employees') {
                deleteEmp();
            }

            if (choices === 'Exit') {
                connection.end();
            }
        })
};

const viewAllDep = () => {
    const sql = `SELECT department.id AS id, department.department_name AS department FROM department`;
    connection.query(sql, (error, response) => {
        if (error) throw error;
        console.table(response);
        console.log('=============================================');
    });
    promptUser();
};

const viewAllRoles = () => {
    const sql = `SELECT role.id, role.title, 
                department.department_name AS department FROM role INNER JOIN department ON role.department_id = department.id`;
    connection.query(sql, (error, response) => {
        if (error) throw error;
        console.table(response);
        console.log('==============================================');
    });
    promptUser();
};

const viewAllEmp = () => {
    const sql = `SELECT employee.id, 
                employee.first_name, 
                employee.last_name, 
                role.title, 
                department.department_name AS 'department', 
                role.salary FROM employee, role, department 
                WHERE department.id = role.department_id AND role.id = employee.role_id ORDER BY employee.id ASC`;
    connection.query(sql, (error, response) => {
        if (error) throw error;
        console.table(response);
        console.log('==========================================');
    });
    promptUser();
};

const viewTotalEmp = () => {
    const sql = `SELECT employee.first_name, 
                employee.last_name, 
                department.department_name AS department
                FROM employee 
                LEFT JOIN role ON employee.role_id = role.id 
                LEFT JOIN department ON role.department_id = department.id`;
    connection.query(sql, (error, response) => {
        if (error) throw error;
        console.table(response);
        console.log('==========================================');
    });
    promptUser();
};

const viewTotalBudget = () => {
    const sql = `SELECT department_id AS id, 
                department.department_name AS department,
                SUM(salary) AS budget
                FROM  role  
                INNER JOIN department ON role.department_id = department.id GROUP BY  role.department_id`;
    connection.query(sql, (error, response) => {
        if (error) throw error;
        console.table(response);
        console.log('==========================================');
    });
    promptUser();
};

const addDep = () => {
    inquirer.prompt([
        {
            name: 'newDepartment',
            type: 'input',
            message: 'What is the name of your new Department?'
        }
    ])
        .then((answer) => {
            let sql = `INSERT INTO department (department_name) VALUES (?)`;
            connection.query(sql, answer.newDepartment, (error, response) => {
                if (error) throw error;
                console.log(answer.newDepartment + ` Department successfully created!`);
                viewAllDep();
            });
        });
};

const addRole = () => {
    const sql = 'SELECT * FROM department'
    connection.query(sql, (error, response) => {
        if (error) throw error;
        let deptNamesArray = [];
        response.forEach((department) => { deptNamesArray.push(department.department_name); });
        deptNamesArray.push('Create Department');
        inquirer.prompt([
            {
                name: 'departmentName',
                type: 'list',
                message: 'Which department is this new role in?',
                choices: deptNamesArray
            }
        ])
            .then((answer) => {
                if (answer.departmentName === 'Create Department') {
                    this.addDep();
                } else {
                    addRoleCont(answer);
                }
            });

        const addRoleCont = (departmentData) => {
            inquirer.prompt([
                {
                    name: 'newRole',
                    type: 'input',
                    message: 'Please enter new role.',
                },
                {
                    name: 'salary',
                    type: 'input',
                    message: 'Please enter new role salary.',
                }
            ])
                .then((answer) => {
                    let createdRole = answer.newRole;
                    let departmentId;

                    response.forEach((department) => {
                        if (departmentData.departmentName === department.department_name) { departmentId = department.id; }
                    });

                    let sql = `INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`;
                    let data = [createdRole, answer.salary, departmentId];

                    connection.promise().query(sql, data, (error) => {
                        if (error) throw error;
                        console.log('New role successfully created.')
                    });
                });
            viewAllRoles();
        };
    });
};

const addEmp = () => {
    inquirer.prompt([
        {
            type: 'input',
            name: 'fistName',
            message: 'Please enter employee first name?',
            validate: addFirstName => {
                if (addFirstName) {
                    return true;
                } else {
                    console.log('Please enter a first name');
                    return false;
                }
            }
        },
        {
            type: 'input',
            name: 'lastName',
            message: 'Please enter employee last name?',
            validate: addLastName => {
                if (addLastName) {
                    return true;
                } else {
                    console.log('Please enter a last name');
                    return false;
                }
            }
        }
    ])
        .then(answer => {
            const crit = [answer.fistName, answer.lastName]
            const roleSql = `SELECT role.id, role.title FROM role`;
            connection.query(roleSql, (error, data) => {
                if (error) throw error;
                const roles = data.map(({ id, title }) => ({ name: title, value: id }));
                inquirer.prompt([
                    {
                        type: 'list',
                        name: 'role',
                        message: 'Please enter employee role?',
                        choices: roles
                    }
                ])
                    .then(roleChoice => {
                        const role = roleChoice.role;
                        crit.push(role);
                        const managerSql = `SELECT * FROM employee`;
                        connection.query(managerSql, (error, data) => {
                            if (error) throw error;
                            const managers = data.map(({ id, first_name, last_name }) => ({ name: first_name + " " + last_name, value: id }));
                            inquirer.prompt([
                                {
                                    type: 'list',
                                    name: 'manager',
                                    message: 'Please enter employee manager?',
                                    choices: managers
                                }
                            ])
                                .then(managerChoice => {
                                    const manager = managerChoice.manager;
                                    crit.push(manager);
                                    const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                                    VALUES (?, ?, ?, ?)`;
                                    connection.query(sql, crit, (error) => {
                                        if (error) throw error;
                                        console.log('Employee has been added!')
                                });
                        viewAllEmp();
                    });
                });
            });
        });
    });
};








