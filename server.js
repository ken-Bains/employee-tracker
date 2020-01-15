const mysql = require("mysql");
const inquirer = require("inquirer");

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
//----------Inital prompts from inqurier
function startPrompts() {
    inquirer.prompt([
        {
            type: "list",
            name: "openingPromptAction",
            message: "what Would you like to do?",
            choices: ["Add Department", "Add Role", "Add Employee"]

        }
    ]).then(function(res){
        switch (res.openingPromptAction) {
            case "Add Department":
                addDepartment();
                break;
            case "Add Role":
                addRole();
                break;
            case "Add Employee":
                addEmployee();
                break;

        }
    });
};
//---------------------------add department functionality
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
//------------------------ add role functionality
function addRole() {
    connection.query("SELECT * FROM departments", function(err, res){
        addRolePrompts(res);
    })
};

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
            console.log(returns);
        })
    })
};

