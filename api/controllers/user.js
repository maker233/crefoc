'use strict'

var User = require('../models/user') // User en mayuscula para indicar que es un modelo

// rutas
function home (req, res) {
  res.status(200).send({
    message: 'Hola mundo desde el servidor de node.js'
  })
}
function pruebas (req, res) {
  res.status(200).send({
    message: 'Acción de pruebas en el servidor de node.js'
  })
}

module.exports = {
  home,
  pruebas
}
