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
  let check = file.replace('/webs', GLOBAL_PATH)
  if (!fs.existsSync(check)) {
    res.redirect('/404')
  }
  return check
}

function fix_path(path){
	if (path[path.length-1] == '/'){
		return path.slice(0,-1)
	} else {
		return path
	}
}

router.get('/404', function (req, res) {
  res.render('404')
})

function processaURL (req, res, next) {
  // Controlem que tingui el programari correctament instalat
  console.log(req.url)
  let urlRequested = fix_path(req.url)
  console.log('url req '+urlRequested)
  let nomWeb = urlRequested.split('/')[2]
  
  let fullPath = check(urlRequested, req, res)
  let path_intern = fix_path(GLOBAL_PATH + '/' + urlRequested.split('/')[2])

  shell.cd(path_intern)
  console.log('current path: '+shell.exec('pwd'))
  if (fs.lstatSync(fullPath).isDirectory()) {
    res.locals.fitxers = shell.exec('ls ' + fullPath).stdout.split('\n').slice(0, -1)
    res.locals.isDirectory = true
    res.locals.route = urlRequested
	if(nomWeb){
		let historial = shell.exec('git log --pretty=format:"%h%x09%an%x09%ad%x09%s"')
		let commits = historial.split('\n').map(dividirCommits)
		res.locals.commits = commits
	}
  } else {
    let historial = shell.exec('git log --pretty=format:"%h%x09%an%x09%ad%x09%s" --follow ' + fullPath)
    let commits = historial.split('\n').map(dividirCommits)

    res.locals.commits = commits
    res.locals.route = urlRequested
    res.locals.isDirectory = false
  }
  next()
}

// WEB ROUTES
router.get('/webs/:path*?', processaURL, function (req, res) {
	console.log(res.locals.route.split('/').slice(0, -1).join())
  if (res.locals.isDirectory) {
	let full_path = res.locals.route
	let full_path_splitted = full_path.split('/')
	let nom_web = full_path_splitted[2]
	let file = full_path_splitted[full_path_splitted.length-1]
	let ruta = full_path.substring(0,full_path.length-file.length)
	console.log('ruta : ')+ruta
    res.render('vista_web', {
      fitxers: res.locals.fitxers,
      pare: res.locals.route,
      commits: res.locals.commits,
	  breadcrums: ruta
      // breadcrums: res.locals.route.split('/').slice(0, -1).join()
    })
  } else {
    console.log('### mostrar fitxer: ' + res.locals.route)
    res.render('vista_fitxer', {
      title: 'GIT!',
      file: res.locals.route,
      commits: res.locals.commits
    })
  }
})

router.post('/diff_web', function(req, res) {
  console.log('\n==========================\n')
  console.log('## REALITZANT DIFF  WEB   ##\n')
  console.log('==========================\n')
  let fullPath = req.body.path
  let commitId = req.body.commit_id
  let nomWeb = check(fullPath, req, res)
  shell.cd(nomWeb)
  let gitDiff = shell.exec('git diff --no-commit-id ' + commitId)
  res.send({
    result: gitDiff,
    missatge: 'Mostrats canvis del commit ' + commitId + ' de la web ' + nomWeb + ' fet!'
  })
}) 

router.post('/show_web', function(req, res) {
  console.log('\n==========================\n')
  console.log('## REALITZANT SHOW WEB    ##\n')
  console.log('==========================\n')
  let fullPath = req.body.path
  let commitId = req.body.commit_id
  let nomWeb = check(fullPath, req, res)
  shell.cd(nomWeb)
  let gitShow = shell.exec('git show ' + commitId)
  res.send({
    result: gitShow,
    missatge: 'Mostrats canvis del commit ' + commitId + ' de la web ' + nomWeb + ' fet!'
  })
}) 

router.post('/diff_tree_web', function(req, res) {
  console.log('\n==========================\n')
  console.log('## REALITZANT DIFF TREE ##\n')
  console.log('==========================\n')
  let fullPath = req.body.path
  let commitId = req.body.commit_id
  let nomWeb = check(fullPath, req, res)
  shell.cd(nomWeb)
  let diffTree = shell.exec('git diff-tree --no-commit-id --name-only -r ' + commitId)
  res.send({
    result: diffTree,
    missatge: 'Mostrats fitxers canviats del commit ' + commitId + ' de la web ' + nomWeb + ' fet!'
  })
  console.log('==========================\n')
}) 

router.post('/restore_web', function (req, res) {
  console.log('\n==========================\n')
  console.log('## REALITZANT RESTORE   ##\n')
  console.log('==========================\n')
  let fullPath = req.body.path
  let commitId = req.body.commit_id
  let nomWeb = check(fullPath, req, res)
  shell.cd(nomWeb)
  shell.exec('git checkout ' + commitId)
  res.send('Restaurat commit ' + commitId + ' de la web ' + nomWeb + ' fet!')
  console.log('==========================\n')
})

router.post('/backup_web', function (req, res) {
  console.log('\n==========================\n')
  console.log('## REALITZANT BACKUP   ##\n')
  console.log('==========================\n')
  console.log(req.body)
  let fullPath = req.body.path
  let nomWeb = check(fullPath, req, res)
  shell.cd(nomWeb)
  let date = shell.exec('date')
  let commitMissatge = 'Commit fet el ' + date
  shell.exec('git add -A')
  shell.exec('git commit -a -m "' + commitMissatge + '"')
  res.send('Backup a ' + nomWeb + ' fet!')
  console.log('==========================\n')
})

router.post('/undo_restore_web', function (req, res) {
  console.log('\n=================================\n')
  console.log('\n## REALITZANT UNDO RESTORE WEB ##\n')
  console.log('\n=================================\n')
  let fullPath = req.body.path
  let nomWeb = check(fullPath, req, res)
  shell.cd(nomWeb)
  shell.exec('git checkout master')
  res.send('Desfet el restaurar versio de la web ' + nomWeb)
  console.log('==========================\n')
})

// FILE ROUTES
router.post('/backup_file', function (req, res) {
  console.log('\n==========================\n')
  console.log('## REALITZANT BACKUP FILE ##\n')
  console.log('==========================\n')
  console.log(req.body)
  let fullPath = req.body.path
  console.log('full path '+fullPath)
  let nomWeb = check(fullPath, req, res)
  shell.cd(nomWeb)
  let date = shell.exec('date')
  let commitMissatge = 'Commit fet el ' + date
  let fileName = req.body.file_name
  shell.exec('git add ' + fullPath)
  shell.exec('git commit -a -m "' + commitMissatge + '"')
  res.send('Backup a ' + fullPath + ' de la web ' + nomWeb + ' fet!')
  console.log('==========================\n')
})

router.post('/restore_file', function (req, res) {
  console.log('\n==========================\n')
  console.log('## REALITZANT RESTORE FILE ##\n')
  console.log('==========================\n')
  let fullPath =  GLOBAL_PATH + '/' + req.body.nom_web
  let fileName = req.body.file_name
  let commitId = req.body.commit_id
  let nomWeb = check(fullPath, req, res)
  shell.cd(nomWeb)
  console.log('comanda a fer: '+'git checkout '+commitId+' ' + fileName)
  shell.exec('git checkout ' + commitId + ' ' + fileName)
  res.send('Restaurat commit ' + commitId + ' del fitxer ' + fileName + ' la web ' + nomWeb + ' fet!')
  console.log('==========================\n')
})

router.post('/diff_file', function (req, res) {
  console.log('\n==========================\n')
  console.log('## REALITZANT DIFF FILE  ##\n')
  console.log('==========================\n')
  let fullPath =  GLOBAL_PATH + '/' + req.body.nom_web
  let fileName = req.body.file_name
  let commitId = req.body.commit_id
  let nomWeb = check(fullPath, req, res)
  shell.cd(nomWeb)
  console.log('comanda a fer: '+'git diff '+commitId+' ' + fileName)
  let diffFile = shell.exec('git diff ' + commitId + ' ' + fileName)
  res.send({
    result: diffFile,
    missatge: 'Restaurat commit ' + commitId + ' del fitxer ' + fileName + ' la web ' + nomWeb + ' fet!'
  })
  console.log('==========================\n')
})

router.post('/show_file', function (req, res) {
  console.log('\n==========================\n')
  console.log('## REALITZANT SHOW FILE  ##\n')
  console.log('==========================\n')
  let fullPath =  GLOBAL_PATH + '/' + req.body.nom_web
  let fileName = req.body.file_name
  let commitId = req.body.commit_id
  let nomWeb = check(fullPath, req, res)
  shell.cd(nomWeb)
  console.log('comanda a fer: '+'git show '+commitId+' ' + fileName)
  let gitShow = shell.exec('git show ' + commitId + ' ' + fileName)
  res.send({
    result: gitShow,
    missatge: 'Restaurat commit ' + commitId + ' del fitxer ' + fileName + ' la web ' + nomWeb + ' fet!'
  })
  console.log('==========================\n')
})


router.post('/back', function (req, res) {
  console.log('\n==========================\n')
  console.log('## TORNANT ENRERE ##\n')
  console.log('==========================\n')
  let fullPath = req.body.path
  let nomWeb = check(fullPath, req, res)
  let redireccio
  res.redirect(redireccio)
  res.send('Tornat enrere de la web ' + nomWeb + ' fet!')
  console.log('==========================\n')
})

// HOME
router.get('/', function (req, res) {
  res.redirect('/webs')
})

module.exports = router
