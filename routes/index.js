'use strict'

const express = require('express')
const shell = require('shelljs')
const fs = require('fs')
const bodyParser = require('body-parser')
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
    let command_ls = shell.exec('ls ' + full_path).stdout.split('\n').slice(0, -1)
    console.log('### command: ' + command_ls)
    res.locals.fitxers = command_ls
    res.locals.isDirectory = true
	res.locals.route = req.url
	
	let command_cd = shell.cd(nom_web)
	let command_log = 'git log --pretty=format:"%h%x09%an%x09%ad%x09%s"'
	let historial = shell.exec(command_log)
	let commits = historial.split('\n').map(dividirCommits)
	res.locals.commits = commits
  } else {
    // let command = shell.exec('git status')
    // let command = shell.exec('git log --pretty=format:"%h%x09%an%x09%ad%x09%s" --follow ' + full_path)
	// let command = shell.exec('git log' + full_path)
	
	let command_cd = shell.cd(nom_web)
	let command_log = 'git log --pretty=format:"%h%x09%an%x09%ad%x09%s" --follow ' + full_path
	let historial = shell.exec(command_log)
	let commits = historial.split('\n').map(dividirCommits)
	//command = 'git diff --no-commit-id -r '+ commits[2]['commit']
	//console.log("\n\n"+command)
	//let command_diff = shell.exec(command)
	//console.log("\n\nCommand DIFF: " + command_diff)
	
	
	
	//console.log("Command historial: "+command_cd + '\n'+command)
	//console.log("Command historial total: "+historial)
    res.locals.commits = commits
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
      pare: res.locals.route,
	  commits: res.locals.commits
    })
  } else {
    console.log('### mostrar fitxer: ' + res.locals.path)
    res.render('vista_fitxer', {
      title: 'GIT!',
      file: res.locals.route,
	  commits: res.locals.commits
    })
  }
})

router.post('/show_diff', function(req, res) {
	let full_path = req.body.path
	let commit_id = req.body.commit_id
	let nom_web = check(full_path, req, res)
	let command_cd = shell.cd(nom_web)
	let command_git_diff = shell.exec('git diff --no-commit-id '+commit_id)
	res.send({
		result: command_git_diff,
		missatge: 'Mostrats canvis del commit '+commit_id+' de la web '+nom_web+' fet!'
	})
}) 

router.post('/show_diff_tree', function(req, res) {
	let full_path = req.body.path
	let commit_id = req.body.commit_id
	let nom_web = check(full_path, req, res)
	let command_cd = shell.cd(nom_web)
	let command_git_diff_tree = shell.exec('git diff-tree --no-commit-id --name-only -r '+commit_id)
	res.send({
		result: command_git_diff_tree,
		missatge: 'Mostrats fitxers canviats del commit '+commit_id+' de la web '+nom_web+' fet!'
	})
}) 

router.post('/restore', function(req, res) {
	let full_path = req.body.path
	let commit_id = req.body.commit_id
	let nom_web = check(full_path, req, res)
	let command_cd = shell.cd(nom_web)
	let command_git_checkout = shell.exec('git checkout '+commit_id)
	res.send('Restaurat commit '+commit_id+' de la web '+nom_web+' fet!')
})

router.post('/backup', function(req, res) {
	console.log(req.body)
	let full_path = req.body.path
	let nom_web = check(full_path, req, res)
	let command_cd = shell.cd(nom_web)
	let date = shell.exec('date')
	let commit_message = 'Commit fet el '+date
	let command_git_add_all = shell.exec('git add -A')
	let command_git_commit_all = shell.exec('git commit -a -m "'+commit_message+'"')
	res.send('Backup a '+nom_web+' fet!')
})

router.post('/undo_restore', function(req, res) {
	let full_path = req.body.path
	let nom_web = check(full_path, req, res)
	let command_cd = shell.cd(nom_web)
	let command_git_checkout_master = shell.exec('git checkout master')
	res.send('Desfet el restaurar versio de la web '+nom_web)
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
