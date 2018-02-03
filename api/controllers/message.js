'use strict'

var moment = require('moment')
var mongoosePaginate = require('mongoose-pagination')

var User = require('../models/user')
var Follow = require('../models/follow')
var Message = require('../models/message')

// MÉTODO DE PRUEBA -----------------------------------------------------------
function probando (req, res) {
  res.status(200).send({message: 'Mensaje de pruebas del controlador Message'})
}

// MÉTODO ENVIAR MENSAJE ENTRE USUARIO
function saveMessage (req, res) {
  var params = req.body // Recogemos las variables que llegan por POST
  if (!params.text || !params.receiver) res.status(200).send({message: 'Envía los datos necesarios'})
// Estas dos propiedades llegan por POST, emmiter por get(URL)
  var message = new Message()
  message.emitter = req.user.sub
  message.receiver = params.receiver // Llega por POST
  message.text = params.text
  message.created_at = moment().unix()
  message.viewed = 'false'

  message.save((err, messageStored) => {
    if (err) res.status(500).send({message: 'Error en la petición'})
    if (!messageStored) res.status(404).send({message: 'El mensaje no se ha enviado'})

    return res.status(200).send({message: messageStored})
  })
}

// MÉTODO LISTAR MENSAJES RECIBIDOS -------------------------------------------
function getReceivedMessages (req, res) {
  var userId = req.user.sub

  var page = 1
  if (req.params.page) {
    page = req.params.page
  }
  var itemsPerPage = 4

  Message.find({receiver: userId}).populate('emitter', 'name surname _id nick image').paginate(page, itemsPerPage, (err, messages, total) => {
// Para popular solo algunos campos los indico populate('emitter', 'name surname _id')
    if (err) res.status(500).send({message: 'Error en la petición'})
    if (!messages) res.status(404).send({message: 'No hay mensajes'})

    return res.status(200).send({
      total: total,
      pages: Math.ceil(total / itemsPerPage),
      messages
    })
  })
}
// MÉTODO LISTAR MENSAJES ENVIADOS --------------------------------------------
function getEmmitMessages (req, res) {
  var userId = req.user.sub

  var page = 1
  if (req.params.page) {
    page = req.params.page
  }
  var itemsPerPage = 4

  Message.find({emitter: userId}).populate('emitter receiver', 'name surname _id nick image').paginate(page, itemsPerPage, (err, messages, total) => {
// Para popular solo algunos campos los indico populate('emitter', 'name surname _id')
    if (err) res.status(500).send({message: 'Error en la petición'})
    if (!messages) res.status(404).send({message: 'No hay mensajes'})

    return res.status(200).send({
      total: total,
      pages: Math.ceil(total / itemsPerPage),
      messages
    })
  })
}
// MÉTODO CUENTA MENSAJES SIN LEER --------------------------------------------
function getUnviewedMessages (req, res) {
  var userId = req.user.sub

  Message.count({receiver: userId, viewed: 'false'}).exec((err, count) => {
    if (err) res.status(500).send({message: 'Error en la petición'})
    return res.status(200).send({
      'unviewed': count
    })
  })
}
// MÉTODO MARCAR MENSAJES COMO LEIDOS AL VER PAGINA MENSAJES -----------------
function setViewedMessages(req, res) {
  var userId = req.user.sub

  Message.update({receiver: userId, viewed: 'false'}, {viewed: 'true'}, {"multi": true}, (err, messageUpdated) => {
    if (err) res.status(500).send({message: 'Error en la petición'})
    return res.status(200).send({
      messages: messageUpdated
    })
  })
}

module.exports = {
  probando,
  saveMessage,
  getReceivedMessages,
  getEmmitMessages,
  getUnviewedMessages,
  setViewedMessages
}
