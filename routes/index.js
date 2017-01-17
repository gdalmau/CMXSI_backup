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
  console.log('checking: ' + check)
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

  let fullPath = check(req.url, req, res)
  let nomWeb = GLOBAL_PATH + '/' + req.url.split('/')[2]

  shell.cd(nomWeb)
  if (fs.lstatSync(fullPath).isDirectory()) {
    res.locals.fitxers = shell.exec('ls ' + fullPath).stdout.split('\n').slice(0, -1)
    res.locals.isDirectory = true
    res.locals.route = req.url

    let historial = shell.exec('git log --pretty=format:"%h%x09%an%x09%ad%x09%s"')
    let commits = historial.split('\n').map(dividirCommits)
    res.locals.commits = commits
  } else {
    let historial = shell.exec('git log --pretty=format:"%h%x09%an%x09%ad%x09%s" --follow ' + fullPath)
    let commits = historial.split('\n').map(dividirCommits)

    res.locals.commits = commits
    res.locals.route = req.url
    res.locals.isDirectory = false
  }
  next()
}

// WEB ROUTES
router.get('/webs/:path*?', processaURL, function (req, res) {
  if (res.locals.isDirectory) {
    res.render('vista_web', {
      fitxers: res.locals.fitxers,
      pare: res.locals.route,
      commits: res.locals.commits,
      breadcrums: res.locals.route.split('/')
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

router.post('/show_diff_web', function(req, res) {
  console.log('\n==========================\n')
  console.log('## REALITZANT DIFF      ##\n')
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

router.post('/show_diff_tree_web', function(req, res) {
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
  console.log('\n=============================\n')
  console.log('\n## REALITZANT UNDO RESTORE ##\n')
  console.log('\n=============================\n')
  let fullPath = req.body.path
  let nomWeb = check(fullPath, req, res)
  shell.cd(nomWeb)
  shell.exec('git checkout master')
  res.send('Desfet el restaurar versio de la web ' + nomWeb)
  console.log('==========================\n')
})

// FILE ROUTES
router.post('/restore_file', function (req, res) {
  console.log('\n==========================\n')
  console.log('## REALITZANT RESTORE   ##\n')
  console.log('==========================\n')
  let fullPath =  GLOBAL_PATH + '/' + req.body.nom_web
  let fileName = req.body.file_name
  let commitId = req.body.commit_id
  let nomWeb = check(fullPath, req, res)
  shell.cd(nomWeb)
  shell.exec('git checkout '+commitId+' ' + fileName)
  console.log('comanda a fer: '+'git checkout '+commitId+' ' + fileName)
  res.send('Restaurat commit ' + commitId + ' del fitxer ' + fileName + ' la web ' + nomWeb + ' fet!')
  console.log('==========================\n')
})


// HOME
router.get('/', function (req, res, next) {
  let listWebs = shell.exec('ls ' + GLOBAL_PATH).split('\n').slice(0, -1)
  console.log('### llistat de webs: ' + listWebs)
  res.locals.list_webs = listWebs
  next()
})

router.get('/', function (req, res) {
  res.render('index')
})

module.exports = router
