'use strict'

const helper = require('./functions')
const colors = require('colors')
const config = require('../config.json')
const rl = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
})

let setDirectory = function() {
    rl.question(colors.blue("==> Introduce the directory where you have the webs (default: /var/www):\n"), (answer) => {
        let success
        if (!answer) answer = '/var/www'
        else if((success = helper.setup(answer))) 
            console.log(colors.green("==> Config file was created successfully!"))
        else 
            console.log(colors.yellow('==> The path introduced doesn\'t exists, make sure Apache is installed correctly or select an existing path!'))
    })
}

let setIP = function() {
    rl.question(colors.blue("==> Set the IP of the host (default: localhost)"), (answer) => {
        if (!answer) 
            config.mysql.host = "localhost"
        else 
            config.mysql.host = answer
    })
}

let setUser = function() {
    rl.question(colors.blue("==> Set MySQL USER"), (answer) => {
        if (!answer){
            console.log(colors.red("You must configure a name"))
            setUser()
        } else 
            config.mysql.user = answer
    })
}

let setPassword = function() {
    rl.question(colors.blue("==> Set MySQL USER"), (answer) => {
        if (!answer){
            console.log(colors.red("You must set the password"))
            setPassword()
        } else 
            config.mysql.password = answer
    })
}

let setDatabase = function() {
    rl.question(colors.blue("==> Set Database to backup"), (answer) => {
        if (!answer){
            console.log(colors.red("You must set a Database"))
            setDatabase()
        } else 
            config.mysql.database = answer
    })
    rl.close()
}

module.exports = {
    setDirectory: setDirectory,
    setIP: setIP,
    setUser: setUser,
    setPassword: setPassword,
    setDatabase: setDatabase
}