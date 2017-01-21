'use strict'

const express = require('express')
const path = require('path')
const app = express()
const body_parser = require('body-parser')
const cron = require('node-cron')
const colors = require('colors')
const helper = require('./helpers/functions')
const config = require('./config')

cron.schedule('0 0 * * *', function() {
  console.log(colors.red("Every minute!!"))
  helper.crontask(config.constants.GLOBAL_PATH)
})

//  Configure app

app.set('view engine', 'hbs')
app.set('views', path.join(__dirname, 'views'))

//  MIDDLEWERE

app.use(express.static(path.join(__dirname, '/public')))
app.use(express.static(path.join(__dirname, '/bower_components')))
app.use(body_parser.urlencoded({ extended: false }))
app.use(body_parser.json())
//  Rutas

app.use('/', require('./routes/index'))

//  LISTEN

const port = process.env.PORT || 3000
app.listen(port, function () {
  console.log('App listening on port ' + port)
})