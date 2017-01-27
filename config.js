'use strict'

const helper = require('./helpers/config')
const colors = require('colors')

helper.setDirectory()
console.log(colors.blue("==> Configure MySQL Dump"))
helper.setIP()
helper.setUser()
helper.setPassword()
helper.setDatabase()