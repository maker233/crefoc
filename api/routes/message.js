'Use strict'

var express = require('express')
var MessageController = require('../controllers/message')
var api = express.Router()

var md_auth = require('../middlewares/authenticated')

api.get('/pruebas-md', md_auth.ensureAuth, MessageController.probando) //Test
api.get('/my-messages/:page?', md_auth.ensureAuth, MessageController.getReceivedMessages) // Mensajes recibidos
api.get('/messages/:page?', md_auth.ensureAuth, MessageController.getEmmitMessages) // Mensajes enviados
api.get('/unviewed-messages', md_auth.ensureAuth, MessageController.getEmmitMessages) // Mensajes sin leer
api.get('/set-viewed-messages', md_auth.ensureAuth, MessageController.setViewedMessages) // Marcamos Mensajes como leido

api.post('/message', md_auth.ensureAuth, MessageController.saveMessage)

module.exports = api
