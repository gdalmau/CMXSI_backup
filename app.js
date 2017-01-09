const express = require('express')
const path = require('path')
const app = express()


//  Configure app

app.set('view engine', 'hbs')
app.set('views', path.join(__dirname, 'views'))

//  MIDDLEWERE

app.use(express.static(path.join(__dirname, '/public')))
app.use('/bower_components', express.static(path.join(__dirname, '/bower_components')))

//  Rutas

app.use('/', require('./routes/index'))
app.use('/git', require('./routes/git'))

//  LISTEN

const port = process.env.PORT || 3000
app.listen(port, function () {
  console.log('App listening on port ' + port)
})

