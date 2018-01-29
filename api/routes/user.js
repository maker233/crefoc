'use strict'

var express = require('express')
var UserController = require('../controllers/user') // Este es el CONTROLADOR

var api = express.Router() // llamamos al metodo router para tener acceso a GET, POST, DELETE ..
var md_auth = require('../middlewares/authenticated')

api.get('/home', UserController.home) // el pah es "/home" y la funcion a cargar es "UserController.home" pero podría ser un Callback
api.get('/pruebas', md_auth.ensureAuth, UserController.pruebas) // toma el segundo parametro (middleware)

api.post('/register', UserController.saveUser)
api.post('/login', UserController.loginUser)

module.exports = api
