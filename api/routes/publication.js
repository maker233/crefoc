'Use strict'

var express = require('express')
var PublicationController = require('../controllers/publication')
var api = express.Router()
var md_auth = require('../middlewares/authenticated')

var multipart = require('connect-multiparty') // metodo subir archivos
var md_upload = multipart({uploadDir: './uploads/publications'}) // aqui se guardan los archivos subidos por el multiparty

api.get('/probando-pub', md_auth.ensureAuth, PublicationController.probando)
api.get('/publications/:page?', md_auth.ensureAuth, PublicationController.getPublications)
api.get('/publication/:id?', md_auth.ensureAuth, PublicationController.getPublication)// Ver publicación
api.get('/get-image-pub/:imageFile', PublicationController.getImageFile) // Devolver imagen publicación

api.get('/explorer/:category', PublicationController.getPublicationCategory)

api.post('/publication', md_auth.ensureAuth, PublicationController.savePublication) // Crear publicación
api.post('/upload-image-pub/:id', [md_auth.ensureAuth, md_upload], PublicationController.uploadImage)

api.delete('/publication/:id', md_auth.ensureAuth, PublicationController.deletePublication)

module.exports = api
