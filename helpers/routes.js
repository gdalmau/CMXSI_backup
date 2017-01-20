'use strict'

const shell = require('shelljs')
const fs = require('fs')
const path = require('path')
const GLOBAL_PATH = require('../config').constants.GLOBAL_PATH
shell.config.silent = true


function fix_path(path){
	if (path[path.length-1] == '/') return path.slice(0,-1)
	else return path
}

function dividirCommits (current, index) {
  let obj = {}
  obj['commit'] = current.split('\t')[0]
  obj['author'] = current.split('\t')[1]
  obj['date'] = current.split('\t')[2]
  obj['message'] = current.split('\t')[3]
  return obj
}

/** 
 * RETORNA LA RUTA DEL PATH SUPERIOR, L'OBJECTE RES HA DE TENIR UNA VARIABLE 
 * AL SCOPE DE LOCALS DE NOM RUTA AMB LA 
 */
function getParentPath(res)
{
  let full_path = res.locals.route
  let full_path_splitted = full_path.split('/')
  let nom_web = full_path_splitted[2]
  let file = full_path_splitted[full_path_splitted.length-1]
  let ruta = full_path.substring(0,full_path.length-file.length)

  return ruta
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

/**
 * 
 * =====================   RUTAS    ======================
 * 
 */


/**
 * METHOD: GET
 * URL: /WEBS
 */
function processaURL (req, res, next) {
  // Controlem que tingui el programari correctament instalat
  let urlRequested = fix_path(req.url)
  let nomWeb = urlRequested.split('/')[2]
  let fullPath = check(urlRequested, req, res)
  let path_intern = fix_path(GLOBAL_PATH + '/' + urlRequested.split('/')[2])

  res.locals.route = urlRequested
  res.locals.ruta = getParentPath(res)
  
  shell.cd(path_intern)
  if (fs.lstatSync(fullPath).isDirectory()) {

    res.locals.fitxers = shell.exec('ls ' + fullPath).stdout.split('\n').slice(0, -1)
    res.locals.isDirectory = true
    
    if(nomWeb)
      res.locals.commits = shell.exec('git log --pretty=format:"%h%x09%an%x09%ad%x09%s"').split('\n').map(dividirCommits)

  } else {
    res.locals.commits = shell.exec('git log --pretty=format:"%h%x09%an%x09%ad%x09%s" --follow ' + fullPath).split('\n').map(dividirCommits)
    res.locals.isDirectory = false
  }
  next()
}

/**
 * METHOD: POST
 * URL: /DIFFFILE
 */
function diffFile(req, res, next) {
  let fullPath =  GLOBAL_PATH + '/' + req.body.nom_web
  let fileName = req.body.file_name
  let commitId = req.body.commit_id
  let nomWeb = check(fullPath, req, res)
  shell.cd(nomWeb)
  //console.log('comanda a fer: '+'git diff '+commitId+' ' + fileName)
  res.locals.message = 'Restaurat commit ' + commitId + ' del fitxer ' + fileName + ' la web ' + nomWeb + ' fet!'
  res.locals.result = shell.exec('git diff ' + commitId + ' ' + fileName)
  next()
}

/**
 * METHOD: POST
 * URL: /DIFFWEB
 */
function diffWeb(req, res, next) {
  let fullPath = req.body.path
  let commitId = req.body.commit_id
  let nomWeb = check(fullPath, req, res)
  shell.cd(nomWeb)
  res.locals.result = shell.exec('git diff --no-commit-id ' + commitId)
  res.locals.message = 'Mostrats canvis del commit ' + commitId + ' de la web ' + nomWeb + ' fet!'
  next()
}

/**
 * METHOD: POST
 * URL: /SHOWWEB
 */
function showWeb(req, res, next) {
  let fullPath = req.body.path
  let commitId = req.body.commit_id
  let nomWeb = check(fullPath, req, res)
  shell.cd(nomWeb)
  res.locals.result = shell.exec('git show ' + commitId)
  res.locals.message = 'Mostrats canvis del commit ' + commitId + ' de la web ' + nomWeb + ' fet!'
  next()
}

/**
 * METHOD: POST
 * URL: /DIFFTREE
 */
function diffTree(req, res, next) {
  let fullPath = req.body.path
  let commitId = req.body.commit_id
  let nomWeb = check(fullPath, req, res)
  shell.cd(nomWeb)
  res.locals.result = shell.exec('git diff-tree --no-commit-id --name-only -r ' + commitId)
  res.locals.message = 'Mostrats fitxers canviats del commit ' + commitId + ' de la web ' + nomWeb + ' fet!'
  next()
}

/**
 * METHOD: POST
 * URL: /RESTOREWEB
 */
function restoreWeb(req, res, next) {
  let fullPath = req.body.path
  let commitId = req.body.commit_id
  let nomWeb = check(fullPath, req, res)
  shell.cd(nomWeb)
  shell.exec('git checkout ' + commitId)
  res.locals.message = 'Restaurat commit ' + commitId + ' de la web ' + nomWeb + ' fet!'
  next()
}
/**
 * METHOD: POST
 * URL: /BACKUPWEB
 */
function backupWeb(req, res, next) {
  let fullPath = req.body.path
  let nomWeb = check(fullPath, req, res)
  shell.cd(nomWeb)
  let date = shell.exec('date')
  let commitMissatge = 'Commit fet el ' + date
  shell.exec('git add -A')
  shell.exec('git commit -a -m "' + commitMissatge + '"')
  res.locals.message = 'Backup a ' + nomWeb + ' fet!'
  next()
}

/**
 * METHOD: POST
 * URL: /undo_restore_web
 */
function unRestoreWeb(req, res, next) {
  let fullPath = req.body.path
  let nomWeb = check(fullPath, req, res)
  shell.cd(nomWeb)
  shell.exec('git checkout master')
  res.locals.message = 'Desfet el restaurar versio de la web ' + nomWeb
  next()
}

/**
 * METHOD: POST
 * URL: /backup_file
 */
function backupFile(req, res, next) {
  let fullPath = req.body.path
  let nomWeb = check(fullPath, req, res)
  shell.cd(nomWeb)
  let date = shell.exec('date')
  let commitMissatge = 'Commit fet el ' + date
  let fileName = req.body.file_name
  shell.exec('git add ' + fullPath)
  shell.exec('git commit -a -m "' + commitMissatge + '"')
  res.locals.message = 'Backup a ' + fullPath + ' de la web ' + nomWeb + ' fet!'
  next()
}

/**
 * METHOD: POST
 * URL: /restore_file
 */
function restoreFile(req, res, next) {
  let fullPath =  GLOBAL_PATH + '/' + req.body.nom_web
  let fileName = req.body.file_name
  let commitId = req.body.commit_id
  let nomWeb = check(fullPath, req, res)
  shell.cd(nomWeb)
  shell.exec('git checkout ' + commitId + ' ' + fileName)
  res.locals.message = 'Restaurat commit ' + commitId + ' del fitxer ' + fileName + ' la web ' + nomWeb + ' fet!'
  next()
}

/**
 * METHOD: POST
 * URL: /show_file
 */
function showFile(req, res, next) {
  let fullPath =  GLOBAL_PATH + '/' + req.body.nom_web
  let fileName = req.body.file_name
  let commitId = req.body.commit_id
  let nomWeb = check(fullPath, req, res)
  shell.cd(nomWeb)
  //console.log('comanda a fer: '+'git show '+commitId+' ' + fileName)
  res.locals.result = shell.exec('git show ' + commitId + ' ' + fileName)
  res.locals.message = 'Restaurat commit ' + commitId + ' del fitxer ' + fileName + ' la web ' + nomWeb + ' fet!'
  next()
}

module.exports = {
    processaURL: processaURL,
    diffFile: diffFile,
    diffWeb: diffWeb,
    showWeb: showWeb,
    diffTree: diffTree,
    restoreWeb: restoreWeb,
    backupWeb: backupWeb,
    unRestoreWeb: unRestoreWeb,
    backupFile: backupFile,
    restoreFile: restoreFile,
    showFile: showFile
}

