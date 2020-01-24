# employee-tracker

## Summary 
This app is a practice in Node JS and MySQL database. Using a Node CLI, this app prompts users to add and modify employee information. 

## Site Picture
![Site](/assets/empl.gif)



## Technologies Used
- Git - version control system to track changes to source code
- GitHub - hosts repository that can be deployed to GitHub Pages
- Node JS - An open-source, cross-platform, JavaScript runtime environment that executes JavaScript code outside of a browser.
- MYSQL - MySQL is an open-source relational database management system.


## Code Snippet
```javascript
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
    ])


```
- The code snippit above shows how the add employee prompts were generated with data from mysql


## Author Links
[LinkedIn](https://www.linkedin.com/in/ken-bains)
[GitHub](https://github.com/ken-Bains)
