'use strict'

const express = require('express')
const shell = require('shelljs')
const fs = require('fs')
// shell.config.silent = true

const GLOBAL_PATH = '/var/www'

const router = express.Router()

function dividirCommits (current, index) {
  let obj = {}
  obj['commit'] = current.split('\t')[0]
  obj['author'] = current.split('\t')[1]
  obj['date'] = current.split('\t')[2]
  obj['message'] = current.split('\t')[3]
  return obj
}

function check (file, req, res) {
  if (!shell.which('git')) {
    res.redirect('/no-git')
    return
  }
  let check = file.replace('/webs',GLOBAL_PATH)
  console.log('checking: '+check)
  if (!fs.existsSync(check)) {
    res.redirect('/404')
  }
  return check
}

router.get('/404', function (req, res) {
  res.render('404')
})

function processaURL (req, res, next) {
  // Controlem que tingui el programari correctament instalat
  
  let full_path = check(req.url, req, res)
  console.log('### fullpath param1: ' + full_path)
  console.log('req.url route: '+req.url)
  
  let nom_web = GLOBAL_PATH+'/'+req.url.split('/')[2]
  
  
  if (fs.lstatSync(full_path).isDirectory()) {
    let command = shell.exec('ls ' + full_path).stdout.split('\n').slice(0, -1)
    console.log('### command: ' + command)
    res.locals.fitxers = command
    res.locals.isDirectory = true
	res.locals.route = req.url
  } else {
    // let command = shell.exec('git status')
    // let command = shell.exec('git log --pretty=format:"%h%x09%an%x09%ad%x09%s" --follow ' + full_path)
	// let command = shell.exec('git log' + full_path)
	let command_cd = shell.cd(nom_web)
	let command = 'git log --pretty=format:"%h%x09%an%x09%ad%x09%s" --follow ' + full_path
	let historial = shell.exec(command)
	console.log("Command historial: "+command_cd + '\n'+command)
	console.log("Command historial total: "+historial)
    res.locals.commits = historial.split('\n').map(dividirCommits)
    res.locals.route = req.url
    res.locals.isDirectory = false
  }
  next()
}

//  ROUTES
router.get('/webs/:path*?', processaURL, function (req, res) {
  if (res.locals.isDirectory) {
    console.log('### mostrar fitxers web: ' + res.locals.route)
	
    res.render('vista_web', {
      fitxers: res.locals.fitxers,
      pare: res.locals.route
    })
  } else {
    console.log('### mostrar fitxer: ' + res.locals.path)
    res.render('vista_fitxer', {
      title: 'GIT!',
      file: res.locals.route,
	  commits: res.locals.commits
    })
  }
  // res.render('vista_fitxer', {
    // title: 'GIT!',
    // history: res.locals.git,
    // nom: 'app.js',
    // arbre: res.locals.tree,
    // path: res.locals.pwd,
    // file: res.locals.file
  // })
})

// HOME
router.get('/', function (req, res, next) {
  let list_webs = shell.exec('ls '+GLOBAL_PATH).split('\n').slice(0, -1)
  console.log('### llistat de webs: ' + list_webs)
  res.locals.list_webs = list_webs
  next()
})

router.get('/', function (req, res) {
  res.render('index')
})

module.exports = router
