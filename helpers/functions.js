'use strict'

const shell = require('shelljs')
const fs = require('fs')
const path = require('path')
const colors = require('colors')

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

        /** For each web, detect if there is a Git Repository */
        llistaWebs.forEach(web => {
            if(!detectGitRepositories(path.join(dir, web)))
                noGitArray.push(web)
        })
        console.log(colors.green('==> Everything was setup correctly!'))
        fs.writeFile(path.join(__dirname, 'backup.conf'), answer, function(err) {
            if(err) return console.log(colors.yellow(err));
        })
        return initializeGitRepos(dir, noGitArray)
    } else return false
}

function crontask (dir) {
    let llistaWebs = fs.readdirSync(dir)
    let directory

    llistaWebs.forEach(web => {
        if (fs.existsSync(dir) && fs.statSync(path.join(dir, web)).isDirectory()){
            directory = path.join(dir, web)
            if(detectGitRepositories(directory)) {
                shell.cd(directory)
                shell.exec('git add -A')
                shell.exec('git commit -am "Backup done at '+ Date.now())
            }
            console.log(colors.green("Backup done for %s"), web)
        }
    })
}

module.exports = {
    setup: setup,
    crontask: crontask
}