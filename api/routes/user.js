'use strict'

var express = require('express')
var UserController = require('../controllers/user') // Este es el CONTROLADOR

var api = express.Router() // llamamos al metodo router para tener acceso a GET, POST, DELETE ..

api.get('/home', UserController.home) // el pah es "/home" y la funcion a cargar es "UserController.home" pero podría ser un Callback
api.get('/pruebas', UserController.pruebas)

api.post('/register', UserController.saveUser)

module.exports = api
