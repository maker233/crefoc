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

  message.save((err, messageStored) => {
    if (err) res.status(500).send({message: 'Error en la petición'})
    if (!messageStored) res.status(404).send({message: 'El mensaje no se ha enviado'})

    return res.status(200).send({message: messageStored})
  })
}

module.exports = {
  probando,
  saveMessage
}
