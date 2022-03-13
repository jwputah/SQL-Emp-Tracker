// Dependencies
const mysql = require('mysql2')
const inquirer = require('inquirer');
const connection = require('./config/connection');
const cTable = require('console.table');

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
                'Update Employee',
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

            if (choices === 'Update Employee') {
                updateEmp();
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

viewAllDep = () => {
    const sql = `SELECT department.id AS id, department.department_name AS department FROM department`;
    connection.query(sql, (error, response) => {
        if (error) throw error;
        console.table(response);
        console.log('=============================================');
        promptUser();
    });
};

viewAllRoles = () => {
    const sql = `SELECT role.id, role.title, 
                department.department_name AS department FROM role INNER JOIN department ON role.department_id = department.id`;
    connection.query(sql, (error, response) => {
        if (error) throw error;
        console.table(response);
        console.log('==============================================');
        promptUser();
    });
};

viewAllEmp = () => {
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
        promptUser();
    });
};

viewTotalEmp = () => {
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
        promptUser();
    });
};

viewTotalBudget = () => {
    const sql = `SELECT department_id AS id, 
                department.department_name AS department,
                SUM(salary) AS budget
                FROM  role  
                INNER JOIN department ON role.department_id = department.id GROUP BY  role.department_id`;
    connection.query(sql, (error, response) => {
        if (error) throw error;
        console.table(response);
        console.log('==========================================');
        promptUser();
    });
};

addDep = () => {
    inquirer.prompt([
        {
            name: 'newDepartment',
            type: 'input',
            message: 'Please enter department name.'
        }
    ])
        .then((answer) => {
            let sql = `INSERT INTO department (department_name) VALUES (?)`;
            connection.query(sql, answer.newDepartment, (error) => {
                if (error) throw error;
                console.log(answer.newDepartment + ` Department successfully created!`);
                viewAllDep();
            });
        });
};

addRole = () => {
    inquirer.prompt([
        {
            type: 'input',
            name: 'role',
            message: "Please enter role to add.",
        },
        {
            type: 'input',
            name: 'salary',
            message: "Please enter salary for this role.",
        }
    ])
        .then(answer => {
            const params = [answer.role, answer.salary];
            const roleSql = `SELECT department_name, id FROM department`;

            connection.query(roleSql, (error, data) => {
                if (error) throw error;
                const dept = data.map(({ department_name, id }) => ({ name: department_name, value: id }));

                inquirer.prompt([
                    {
                        type: 'list',
                        name: 'dept',
                        message: "Please enter department for this role.",
                        choices: dept
                    }
                ])
                    .then(deptChoice => {
                        const dept = deptChoice.dept;
                        params.push(dept);
                        const sql = `INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`;

                        connection.query(sql, params, (error) => {
                            if (error) throw error;
                            console.log(answer.role + " Added to roles.");
                            viewAllRoles();
                        });
                    });
            });
        });
};

addEmp = () => {
    inquirer.prompt([
        {
            type: 'input',
            name: 'fistName',
            message: 'Please enter employee first name.',
        },
        {
            type: 'input',
            name: 'lastName',
            message: 'Please enter employee last name.',
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
                        message: 'Please enter employee role.',
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
                                    message: 'Please enter employee manager.',
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
                                        console.log('Employee has been added.')
                                        viewAllEmp();
                                    });
                                });
                        });
                    });
            });
        });
};

updateEmp = () => {
    const employeeSql = `SELECT * FROM employee`;

    connection.query(employeeSql, (error, data) => {
        if (error) throw error;
        const employees = data.map(({ id, first_name, last_name }) => ({ name: first_name + " " + last_name, value: id }));

        inquirer.prompt([
            {
                type: 'list',
                name: 'name',
                message: "Please select employee to update.",
                choices: employees
            }
        ])
            .then(empChoice => {
                const employee = empChoice.name;
                const params = [];
                params.push(employee);
                const roleSql = `SELECT * FROM role`;

                connection.query(roleSql, (error, data) => {
                    if (error) throw error;
                    const roles = data.map(({ id, title }) => ({ name: title, value: id }));

                    inquirer.prompt([
                        {
                            type: 'list',
                            name: 'role',
                            message: "Please select employee role.",
                            choices: roles
                        }
                    ])
                        .then(roleChoice => {
                            const role = roleChoice.role;
                            params.push(role);
                            let employee = params[0]
                            params[0] = role
                            params[1] = employee
                            const sql = `UPDATE employee SET role_id = ? WHERE id = ?`;

                            connection.query(sql, params, (error) => {
                                if (error) throw error;
                                console.log("Employee has been updated.");
                                viewAllEmp();
                            });
                        });
                });
            });
    });
};

deleteRole = () => {
    const sql = `SELECT * FROM role`;
    connection.query(sql, (error, data) => {
        if (error) throw error;
        const role = data.map(({ title, id }) => ({ name: title, value: id }));

        inquirer.prompt([
            {
                type: 'list',
                name: 'role',
                message: "Please select role to DELETE.",
                choices: role
            }
        ])
            .then(roleChoice => {
                const roleDel = roleChoice.role;
                const sql = `DELETE FROM role WHERE id = ?`;

                connection.query(sql, roleDel, (error) => {
                    if (error) throw error;
                    console.log("Role successfully DELETED.");
                    viewAllRoles();
                });
            });
    });
};

deleteDep = () => {
    const depsql = `SELECT * FROM department`;
    connection.query(depsql, (error, data) => {
        if (error) throw error;

        const dept = data.map(({ department_name, id }) => ({ name: department_name, value: id }));
        inquirer.prompt([
            {
                type: 'list',
                name: 'dept',
                message: "Please select department to DELETE.",
                choices: dept
            }
        ])
            .then(deptChoice => {
                const dept = deptChoice.dept;
                const sql = 'DELETE FROM department WHERE id = ?';

                connection.query(sql, dept, (error, result) => {
                    if (error) throw error;
                    console.log("Department successfully DELETED.");
                    viewAllDep();
                });
            });
    });
};

deleteEmp = () => {
    const sql = `SELECT * FROM employee`;
    connection.query(sql, (error, data) => {
        if (error) throw error;
        const emp = data.map(({ id, first_name, last_name }) => ({ name: first_name + " " + last_name, value: id }));
        inquirer.prompt([
            {
                type: 'list',
                name: 'name',
                message: "Please select employee to DELETE.",
                choices: emp
            }
        ])
            .then(empChoice => {
                const employee = empChoice.name;
                const sql = `DELETE FROM employee WHERE employee.id = ?`;

                connection.query(sql, employee, (error) => {
                    if (error) throw error;
                    console.log("Employee successfully DELETED.");
                    viewAllEmp();
                });
            });
    });
};








