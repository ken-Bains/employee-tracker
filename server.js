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
            choices: ["Add Department", "Add Role", "Add Employee", "View all employees", "View all roles", "View all departments", "Update employees role", "Update employees manager", "Delete department"]

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
            case "Update employees role":
                queryAllEmployees("updateRole")
                break;
            case "Update employees manager":
                queryAllEmployees("updateManager")
                break;
            case "Delete department":
                queryAllDepartments("deleteDepartment");
                break;

        }
    });
};
function stopProgram(){
    inquirer.prompt({
        name: "stopOption",
        message: "would you like to stop or do another task?",
        choices: ["stop", "Keep going"],
        type: "list"
    }).then(function(res) {
        if(res.stopOption === "stop") {
            connection.end()
        } else {
            startPrompts();
        }
    }).catch(function(err){
        if(err) throw err;
    });
}
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
            stopProgram();
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
        stopProgram();

    })
};

//--------------------------------------- add EMPLOYEE functionality
function addEmployeePrompts(roles, managers) {
    let rolesArray = roles.map(element => {return element.title});
    let managersArray = managers.map(element => {return `${element.first_name} ${element.last_name}`});
    managersArray.unshift("none");

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
            name: "employeesRole",
            type: "list",
            message: "What is the employees role?",
            choices: rolesArray
        },
        {
            name: "employeesManager",
            type: "list",
            message: "Who is the employees manager?",
            choices: managersArray
        }
    ]).then(function(res) {
        let managerId;
        let roleId;

        managers.forEach(element => {
            if(`${element.first_name} ${element.last_name}` === res.employeesManager) {
                managerId = element.id
            } else {
                managerId = null;
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
        });
        stopProgram();

    }).catch(err => console.error(err));
}

//--------------------------------------------------UPDATE EMPLOYEE ROLE/MANAGER
function updateEmployee(flag, employeesList, rolesList) {
    var rolesArray;
    var promptName = "role";
    
    var employeeNames = employeesList.map(element => {
        return element.name
    });

    if(flag === "updateManager") {
        promptName = "manager";
        rolesArray = rolesList.map(element => {
            var str = `${element.first_name} ${element.last_name}`;
            return str
        });
    } else {
        rolesArray = rolesList.map(element => {
            return element.title
        });
    }

    inquirer.prompt([
        {
            name: "employeeProfile",
            message: "which employee would you like to update?",
            type: "rawlist",
            choices: employeeNames
        },
        {
            name: "rolesProfile",
            message: `What is the employees new ${promptName}?`,
            type: "rawlist",
            choices: rolesArray
        }
    ]).then(function(resp) {
        var employeeId;
        var roleId;
        var queryName; 

        if(flag === "updateManager") {
            rolesList.forEach(element => {
                var str = `${element.first_name} ${element.last_name}`;
                if(str === resp.rolesProfile){
                    roleId = element.id;
                }
            });
            queryName = "manager_id"    
        } else {
            rolesList.forEach(element => {
                if(element.title === resp.rolesProfile){
                    roleId = element.id;
                }
            });
            queryName = "role_id"    
        }
        employeesList.forEach(element => {
            if(element.name === resp.employeeProfile){
                employeeId = element.id;
            }
        });
        connection.query(`UPDATE employees SET ${queryName}=${roleId} WHERE id=${employeeId}`, function(err, response) {
            if(err) throw err;
        });
        stopProgram();

    }).catch(function(err){
        if(err) throw err;
    })
};

//--------------------------------------- querys of database
function queryAllMangers(flag, arrays) {
    connection.query("SELECT * FROM employees WHERE employees.manager_id IS NULL", function(err, res){
        if(err) throw err;
        if(flag === "updateManager") {
            updateEmployee("updateManager", arrays, res)
        } else{
            addEmployeePrompts(arrays, res);
        }
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
                stopProgram();
                break;
            case "deleteDepartment":
                deleteDepartment(res);
                break;
        }
    })
};

function queryAllRoles(functionFlag, employees) {
    connection.query("SELECT roles.id, roles.title, roles.salary FROM roles", function(err, res){
        if(err) throw err;
        switch (functionFlag) {
            case "addEmployee":
                queryAllMangers("updateRoles", res);
                break;
            case "viewRoles":
                console.table(res);
                stopProgram();
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
                stopProgram();
                break;
            case "updateRole":
                queryAllRoles("updateRole", resp);
                break;
            case "updateManager":
                queryAllMangers("updateManager", resp);
                break;

        }
    });
};

//--------------------------------------------------------------DELETE DEPARTMENT
function deleteDepartment(departments) {

    inquirer.prompt({
        name: "departmentChoice",
        type: "list",
        message: "which department would you like to remove?",
        choices: departments
    }).then(function(res) {
        var departmentId = departments.find(element => {
            return element.name === res.departmentChoice
        });
        connection
    }).catch(function(err){
        if(err) throw err;
    })
}