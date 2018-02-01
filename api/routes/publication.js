'Use strict'

var express = require('express')
var PublicationController = require('../controllers/publication')
var api = express.Router()
var md_auth = require('../middlewares/authenticated')

var multipart = require('connect-multiparty') // metodo subir archivos
var md_upload = multipart({uploadDir: './uploads/publications'}) // aqui se guardan los archivos subidos por el multiparty

api.get('/probando-pub', md_auth.ensureAuth, PublicationController.probando)

api.post('/publication', md_auth.ensureAuth, PublicationController.savePublication)

module.exports = api
