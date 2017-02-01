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

setDirectory();