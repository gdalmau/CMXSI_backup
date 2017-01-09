'use strict'

const express = require('express')
const shell = require('shelljs')
const fs = require('fs')
shell.config.silent = true

const dirTree = require('directory-tree')
const tree = dirTree('./')

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

function check(file, req, res){
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

router.param('path', function (req, res, next, path) {
  //Controlem que tingui el programari correctament instalat
	check(path, req, res)
	
	let full_path = GLOBAL_PATH + path
	console.log("fullpath " + full_path)
	
	
	if(fs.lstatSync(full_path).isDirectory()){
		let command = shell.exec('ls '+ full_path).stdout.split('\n').slice(0,-1)
		console.log(command)
		res.locals.fitxers = command
		res.locals.pare = path
		// res.render('vista_web',{
			// fitxers: command,
			// pare: path
		// })
	}
	else{
		let command = shell.exec('git status')
		let path2 = shell.exec('git log --pretty=format:"%h%x09%an%x09%ad%x09%s" --follow ' + aux)
		
		res.locals.pwd = path2.split('\n').map(dividirCommits)
		res.locals.path = path
		res.locals.fitxers = command
		
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
})

//  ROUTES
router.get('/:path', function (req, res) {
	
	
	let full_path = GLOBAL_PATH + path
	console.log("fullpath " + full_path)
	
	
	if(fs.lstatSync(full_path).isDirectory()){
		res.render('vista_web',{
			fitxers: command,
			pare: path
		})
	}
	else{
		res.render('vista_fitxer',{
			fitxers: command,
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
router.get('/', function (req, res, next){
	let list_webs = shell.exec('ls /var/www').split("\n").slice(0,-1)
	console.log(list_webs)
	res.locals.sth = list_webs
	next()
})

router.get('/', function (req, res) {
  res.render('index', {
    arbre: res.locals.sth
  })
})



router.get('/log', function (req, res) {
  res.render('formInput', {
    title: 'GIT!'
  })
})

module.exports = router
