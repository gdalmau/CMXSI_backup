'use strict'

const shell = require('shelljs')
const fs = require('fs')
const path = require('path')
const readline = require('readline')
const colors = require('colors')

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

/** 
 * Li dones un directori i et diu si hi ha un repositori de GIT
*/
function detectGitRepositories(dir) {
    let git = false
    let llista = []
    let i
    if (fs.statSync(dir).isDirectory()) {
        i = 0
        llista = fs.readdirSync(dir)
        for (i = 0; i < llista.length; i++) {
            if (llista[i] === ".git") return true
            if (llista[i][0] !== ".") break
        }
        return false
    }
    return true
}

/**
 * Initializes Git repositories on all the elements (which meant to be webs) of the array
 */
function initializeGitRepos(dir, array) {
    if (!array || array.length == 0) 
        console.log(colors.cyan("==> Repositories already created"))
    else {
        array.forEach(web => {
            shell.cd(path.join(dir, web))
            shell.exec("git init")
        })
    }
    return true
}

function setup(dir) {
    let noGitArray = []
    if (fs.existsSync(dir)){
        let llistaWebs = fs.readdirSync(dir)

        llistaWebs.forEach(web => {
            if(!detectGitRepositories(path.join(dir, web)))
                noGitArray.push(web)
        })
        console.log(colors.green('==> Everything was setup correctly!'))
        return initializeGitRepos(dir, noGitArray)
    } else return false
}

rl.question(colors.blue("==> Introduce the directory where you have the webs (default: /var/www):\n"), (answer) => {
    if (!answer) answer = '/var/www'
    if (!fs.existsSync(answer)) {
        console.log(colors.yellow('==> The path introduced doesn\'t exists, make sure Apache is installed correctly or select an existing path!'))
        rl.close()
        return false
    }
    else if(setup(answer)) {
        fs.writeFile(path.join(__dirname, 'backup.conf'), answer, function(err) {
            if(err) return console.log(colors.yellow(err));
        })
        console.log(colors.green("==> Config file was created successfully!"))
    }
    rl.close()

    if (!fs.existsSync(path.resolve(__dirname, 'backup.conf'))) 
        console.log(colors.red("==> Something went wrong! - Install me Again!").underline)
    return true
})