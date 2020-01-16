const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require('console.table');


var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "password",
    database: "employees_db"
});

connection.connect(err => {
    if(err) throw err
    console.log("connected");
    startPrompts();
});

//-------------------------------------------Inital prompts from inqurier
function startPrompts() {
    inquirer.prompt([
        {
            type: "list",
            name: "openingPromptAction",
            message: "what Would you like to do?",
            choices: ["Add Department", "Add Role", "Add Employee", "View all employees", "View all roles", "View all departments", "Update Employees Role"]

        }
    ]).then(function(res){
        switch (res.openingPromptAction) {
            case "Add Department":
                addDepartment();
                break;
            case "Add Role":
                queryAllDepartments("addRoles");
                break;
            case "Add Employee":
                queryAllRoles("addEmployee");
                break;
            case "View all employees":
                queryAllEmployees("viewEmployees");
                break;
            case "View all roles":
                queryAllRoles("viewRoles");
                break;
            case "View all departments":
                queryAllDepartments("viewDepartments");
                break;
            case "Update Employees Role":
                queryAllEmployees("updateRole")
                break;

        }
    });
};

//--------------------------------------add DEPARTMENT functionality
function addDepartment() {
    inquirer.prompt([
        {
            type: "input",
            name: "departmentName",
            message: "What is the name of the department?"
        }
    ]).then(function(res){
        connection.query("INSERT INTO departments SET ?", {name: res.departmentName}, function(err){
            if(err) throw err;

        })
    });
};



//--------------------------------------- add ROLES functionality
function addRolePrompts(choicesArray) {
    inquirer.prompt([
        {
            type: "input",
            name: "roleTitle",
            message: "What role would you like to add?"
        },
        {
            type: "input",
            name: "roleSalary",
            message: "What is this roles salary?"
        },
        {
            type: "list",
            name: "rolesDepartment",
            message: "What department is under?",
            choices: choicesArray
        }
    ]).then(function(res) {
        let departmentId;
        choicesArray.forEach(element => {
            if(res.rolesDepartment === element.name){
                departmentId = element.id;
            }
        });

        connection.query(`INSERT INTO roles SET ?`, {
            title: res.roleTitle,
            salary: res.roleSalary,
            department_id: departmentId
        }, function(err, returns){
            if(err) throw err;
        })
    })
};

//--------------------------------------- add EMPLOYEE functionality
function addEmployeePrompts(roles, managers) {
    let rolesArray = roles.map(element => {return element.title});
    let managersArray = managers.map(element => {return `${element.first_name} ${element.last_name}`});

    inquirer.prompt([
        {
            name: "employeesFirstName",
            type: "input",
            message: "What is the employees first name?"
        },
        {
            name: "employeesLastName",
            type: "input",
            message: "What is the employees last name?"
        },
        {
            name: "employeesManager",
            type: "list",
            message: "Who is the employees manager?",
            choices: managersArray
        },
        {
            name: "employeesRole",
            type: "list",
            message: "What is the employees role?",
            choices: rolesArray
        }
    ]).then(function(res) {
        let managerId;
        let roleId;

        managers.forEach(element => {
            if(`${element.first_name} ${element.last_name}` === res.employeesManager) {
                managerId = element.id
            } 
        });
        roles.forEach(element => {
            if(element.title === res.employeesRole) {
                roleId = element.id
            } 
        });

        connection.query("INSERT INTO employees SET ?", {
            first_name: res.employeesFirstName,
            last_name: res.employeesLastName,
            role_id: roleId,
            manager_id: managerId
        })
    }).catch(err => console.error(err ,"ssa"));
}

//--------------------------------------- querys of database
function queryAllMangers(roles) {
    connection.query("SELECT * FROM roles WHERE title='manager'", function(err, res){
        if(err) throw err;
        connection.query(`SELECT * FROM employees WHERE role_id=${res[0].id}`, function(err, resp){
            if(err) throw err
            addEmployeePrompts(roles, resp);
        });
    })
};

function queryAllDepartments(functionFlag) {
    connection.query("SELECT * FROM departments", function(err, res){
        if(err) throw err;
        switch (functionFlag) {
            case "addRoles":
                addRolePrompts(res);
                break;
            case "addEmployee":
                queryAllMangers(res);
                break;
            case "viewDepartments":
                console.table(res);
                break;
        }
    })
};

function queryAllRoles(functionFlag, employees) {
    connection.query("SELECT roles.id, roles.title, roles.salary FROM roles", function(err, res){
        if(err) throw err;
        switch (functionFlag) {
            case "addEmployee":
                queryAllMangers(res);
                break;
            case "viewRoles":
                console.table(res);
                break;
            case "updateRole":
                updateEmployee("updateRole", employees, res);
                break;
        }
    })
};

function queryAllEmployees(functionFlag) {
    var queryString = `
        SELECT employees.id, CONCAT_WS(" ", employees.first_name, employees.last_name) AS name ,roles.title, roles.salary, departments.name AS department, CONCAT_WS(" ", e.first_name, e.last_name) AS manager
        FROM employees
        INNER JOIN roles
        ON employees.role_id = roles.id
        LEFT JOIN departments
        ON roles.department_id = departments.id
        LEFT JOIN employees e
        ON employees.manager_id = e.id
    `
    connection.query(queryString, function(err, resp) {
        switch (functionFlag) {
            case "viewEmployees":
                console.table(resp);
                break;
            case "updateRole":
                queryAllRoles("updateRole", resp);
                break;

        }
    });
};

function updateEmployee(flag, employeesList, rolesList) {
    var employeeNames = employeesList.map(element => {
        return element.name
    });
    var rolesArray = rolesList.map(element => {
        return element.title
    });
    inquirer.prompt([
        {
            name: "employeeProfile",
            message: "which employee would you like to update?",
            type: "rawlist",
            choices: employeeNames
        },
        {
            name: "rolesProfile",
            message: "What is the employees new role?",
            type: "rawlist",
            choices: rolesArray
        }
    ]).then(function(resp) {
        var employeeId;
        var roleId;
        employeesList.forEach(element => {
            if(element.name === resp.employeeProfile){
                employeeId = element.id;
            }
        });
        rolesList.forEach(element => {
            if(element.title === resp.rolesProfile){
                roleId = element.id;
            }
        });
        connection.query(`UPDATE employees SET role_id=${roleId} WHERE id=${employeeId}`, function(err, response) {
            if(err) throw err;
            console.log(response);
        })
    }).catch(function(err){
        if(err) throw err;
    })
}