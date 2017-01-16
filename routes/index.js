'use strict'

const express = require('express')
const shell = require('shelljs')
const fs = require('fs')
shell.config.silent = true

const GLOBAL_PATH = '/var/www/'

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
  if (!file) {
    res.redirect('/404')
    return
  }
}

router.get('/404', function (req, res) {
  res.render('404')
})

/*router.param('path', function (req, res, next, path) {
  // Controlem que tingui el programari correctament instalat
  if (path.match('favicon')) {
    return
  }
  check(path, req, res)

  let full_path = GLOBAL_PATH + path
  console.log('### fullpath param1: ' + full_path)

  if (fs.lstatSync(full_path).isDirectory()) {
    let command = shell.exec('ls ' + full_path).stdout.split('\n').slice(0, -1)
    console.log('### command: ' + command)
    res.locals.fitxers = command
    res.locals.path = path
    res.locals.isDirectory = true
		// res.render('vista_web',{
			// fitxers: command,
			// pare: path
		// })
  } else {
    let command = shell.exec('git status')
    let path2 = shell.exec('git log --pretty=format:"%h%x09%an%x09%ad%x09%s" --follow ' + path)

    res.locals.pwd = path2.split('\n').map(dividirCommits)
    res.locals.path = path
    res.locals.historial_fitxer = command
    res.locals.isDirectory = false

		// res.render('vista_fitxer',{
			// fitxers: command,
			// title: 'GIT!',
			// path: res.locals.pwd,
			// file: res.locals.path
		// })
  }

	// let command = "find . \\( -path './node_modules' -o -path './bower_components' -o -path './data' \\) -prune -o -iname '"+ file +"' -print"
	// let aux = shell.exec(command).stdout
	// console.log(aux)
	// if (!aux) {
		// res.redirect('404')
		// return
	// }

	// let path = shell.exec('git log --pretty=format:"%h%x09%an%x09%ad%x09%s" --follow ' + aux)
	// res.locals.pwd = path.split('\n').map(dividirCommits)
	// res.locals.file = file
  next()
})*/

//  ROUTES
router.get('/webs/:path*?', function (req, res) {
	// if(fs.lstatSync(full_path).isDirectory()){
  if (res.locals.isDirectory) {
    console.log('### mostrar fitxers web: ' + res.locals.path)
    res.render('vista_web', {
      fitxers: res.locals.fitxers,
      pare: res.locals.path
    })
  } else {
    console.log('### mostrar fitxer: ' + res.locals.path)
    res.render('vista_fitxer', {
      historial_fitxer: res.locals.historial_fitxer,
      title: 'GIT!',
      path: res.locals.pwd,
      file: res.locals.path
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
  let list_webs = shell.exec('ls /Users/OriolTestart/Documents/CMX/CMXSI_backup').split('\n').slice(0, -1)
  console.log('### llistat de webs: ' + list_webs)
  res.locals.list_webs = list_webs
  next()
})

router.get('/', function (req, res) {
  res.render('index')
})

module.exports = router
