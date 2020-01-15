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
    // startPrompts();\
    getDepartments();
});

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

function addRole() {
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
            choices: getDepartments()
        }
    ])
};

function getDepartments() {
    var departmentArr = [];

    connection.query("SELECT * FROM departments", function(err, res){
        if(err) throw err;
        console.log(res);
    })
    console.log(departmentArr);
    // return departmentArr
};