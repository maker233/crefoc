'use strict'
// metodos para actualizar, borrar, subir ficheros...

var fs = require('fs')
var path = require('path')
var moment = require('moment')
var mongoosePaginate = require('mongoose-pagination')

var Publication = require('../models/publication')
var User = require('../models/user')
var Follow = require('../models/follow')

// MODELO prueba

function probando (req, res) {
  res.status(200).send({message: 'Hola desde el controlador de publicaciones'})
}

// MÓDULO GUARDAR NUEVAS publicaciones
function savePublication (req, res) {
  var params = req.body// Recogemos los parametros que llegan por body
  if (!params.text) return res.status(200).send({message: 'Debes enviar un texto'}) // Texto obligatorio

  var publication = new Publication() // creamos un objeto Publication y seteamos los datos
  publication.text = params.text
  publication.file = 'null'
  publication.user = req.user.sub
  publication.created_at = moment().unix()

  publication.save((err, publicationStored) => {
    if (err) return res.status(500).send({message: 'Error al guardar la publicación'})

    if (!publicationStored) return res.status(404).send({message: 'La publicación no ha sido guardada'})

    return res.status(200).send({publication: publicationStored})
  })
}

module.exports = {
  probando,
  savePublication
}
