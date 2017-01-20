'use strict'
const shell = require('shelljs')
const fs = require('fs')
const path = require('path')

const GLOBAL_PATH = '/Users/OriolTestart/Projectes/Exemple'

function initializeGitRepos() {
    let llistaWebs = fs.readdirSync(GLOBAL_PATH)
    let llista = []
    let noGitArray = []
    let git = false
    let i

    llistaWebs.forEach(web => {
        if (fs.statSync(path.join(GLOBAL_PATH, web)).isDirectory()) {
            i = 0
            llista = fs.readdirSync(path.join(GLOBAL_PATH, web))
            for (i = 0; i < llista.length; i++) {
                if (llista[i] === ".git") git = true
                if (llista[i][0] !== ".") break
            }
            if (!git) noGitArray.push(web)
            git = false
        }
    })
    if (noGitArray.length == 0) console.log("Ja estan creats tots els repositoris")
    else {
        noGitArray.forEach(web => {
            shell.cd(path.join(GLOBAL_PATH, web))
            shell.exec("git init")
        })
    }
}

initializeGitRepos()

/*
.forEach(item => {
                if (fs.statSync(path.join(__dirname, web, item)).isDirectory()) {
                    console.log(item)
                    if (item == ".git") {
                        existeix = true
                    }
                }
            })*/