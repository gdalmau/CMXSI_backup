'use strict'

const express = require('express')
const path = require('path')
const app = express()
const body_parser = require('body-parser')
const shell = require('shelljs')
const cron = require('node-cron')
const colors = require('colors')
const helper = require('./helpers/functions')
const GLOBAL_PATH = require('fs').readFileSync('backup.conf').toString() 


module.exports = { 
  GLOBAL_PATH: GLOBAL_PATH
}

cron.schedule('* * * * *', function() {
  console.log(colors.red("Every minute!!"))
  helper.crontask(GLOBAL_PATH)
})

//  Configure app

app.set('view engine', 'hbs')
app.set('views', path.join(__dirname, 'views'))

//  MIDDLEWERE

app.use(express.static(path.join(__dirname, '/public')))
app.use('/bower_components', express.static(path.join(__dirname, '/bower_components')))
app.use(body_parser.urlencoded({ extended: false }))
app.use(body_parser.json())
//  Rutas

app.use('/', require('./routes/index'))

//  LISTEN

const port = process.env.PORT || 3000
app.listen(port, function () {
  console.log('App listening on port ' + port)
})