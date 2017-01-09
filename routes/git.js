'use strict'

const express = require('express')
const shell = require('shelljs')
shell.config.silent = true

const dirTree = require('directory-tree')
const tree = dirTree('./')


const router = express.Router()

function dividirCommits (current, index) {
  let obj = {}
  obj['commit'] = current.split('\t')[0]
  obj['author'] = current.split('\t')[1]
  obj['date'] = current.split('\t')[2]
  obj['message'] = current.split('\t')[3]
  return obj
}


router.get('/404', function (req, res) {
  res.render('404')
})

router.param('file', function (req, res, next, file) {
  //Controlem que tingui el programari correctament instalat
  if (!shell.which('git')) {
    res.redirect('/no-git')
    return
  }
  if (!file) {
    res.redirect('/404')
    return
  }

  let command = "find . \\( -path './node_modules' -o -path './bower_components' -o -path './data' \\) -prune -o -iname '"+ file +"' -print"
  let aux = shell.exec(command).stdout
  if (!aux) {
    res.redirect('404')
    return
  }
  let path = shell.exec('git log --pretty=format:"%h%x09%an%x09%ad%x09%s" --follow ' + aux)
  res.locals.pwd = path.split('\n').map(dividirCommits)
  res.locals.file = file
  next()
})

//  ROUTES
router.get('/:file', function (req, res) {
  res.render('vista_fitxer', {
    title: 'GIT!',
    history: res.locals.git,
    nom: 'app.js',
    arbre: res.locals.tree,
    path: res.locals.pwd,
    file: res.locals.file
  })
})

router.get('/', function (req, res) {
  res.render('index', {
    arbre: tree
  })
})

router.get('/log', function (req, res) {
  res.render('formInput', {
    title: 'GIT!'
  })
})

module.exports = router
