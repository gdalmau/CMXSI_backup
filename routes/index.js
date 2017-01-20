'use strict'

const express = require('express')
const shell = require('shelljs')
const fs = require('fs')
const helper = require('../helpers/routes')
shell.config.silent = true

const router = express.Router()

router.get('/404', function (req, res) {
  res.render('404')
})

//TODO -> Canviar breadcrums + res.locals.ruta a noms més explicatius

// WEB ROUTES
router.get('/webs/:path*?', helper.processaURL, function (req, res) {
  if (res.locals.isDirectory) {
    res.render('vista_web', {
      fitxers: res.locals.fitxers,
      pare: res.locals.route,
      commits: res.locals.commits,
      breadcrums: res.locals.ruta
    })
  } else {
    res.render('vista_fitxer', {
      title: 'GIT!',
      file: res.locals.route,
      commits: res.locals.commits,
      breadcrums: res.locals.ruta,
    })
  }
})

router.post('/diff_web', helper.diffWeb, function(req, res) {
  res.send({
    result: res.locals.result,
    missatge: res.locals.message
  })
}) 

router.post('/show_web', helper.showWeb, function(req, res) {
  res.send({
    result: res.locals.result,
    missatge: res.locals.message
  })
}) 

router.post('/diff_tree_web', helper.diffTree, function(req, res) {
  res.send({
    result: res.locals.result,
    missatge: res.locals.message
  })
}) 

router.post('/restore_web', helper.restoreWeb, function (req, res) {
  res.send({
    missatge: res.locals.message
  })
})

router.post('/backup_web', helper.backupWeb, function (req, res) {
  res.send({
    missatge: res.locals.message
  })
})

router.post('/undo_restore_web', helper.unRestoreWeb, function (req, res) {
  res.send({
    missatge: res.locals.message
  })
})

// FILE ROUTES
router.post('/backup_file', helper.backupFile, function (req, res) {
  res.send({
    missatge: res.locals.message
  })
})

router.post('/restore_file', helper.restoreFile, function (req, res) {
  res.send({
    missatge: res.locals.message
  })
})

router.post('/diff_file', helper.diffFile, function (req, res) {
  res.send({
    result: res.locals.result,
    missatge: res.locals.message 
  })
})

router.post('/show_file', helper.showFile, function (req, res) {
  res.send({
    result: res.locals.result,
    missatge: res.locals.message
  })
})

// HOME
router.get('/', function (req, res) {
  res.redirect('/webs')
})

module.exports = router
