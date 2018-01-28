'use strict'

var express = require('express')
var UserController = require('../controllers/user')

var api = express.Router() // llamamos al metodo router para tener acceso a GET, POST, DELETE ..

api.get('/home', UserController.home)
api.get('/pruebas', UserController.pruebas)

module.exports = api
