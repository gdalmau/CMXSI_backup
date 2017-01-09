const express = require('express')

var router = express.Router()

//  ROUTES
router.get('/', function (req, res) {
  res.render('index', {
    title: 'TITOL!'
  })
})

router.get('/no-git', function (req, res) {
  res.render('no-git')
})

module.exports = router
