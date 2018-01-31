'use strict'

// var path = require('path')
// var fs = require('fs')
var mongoosePaginate = require('mongoose-pagination')

var User = require('../models/user')
var Follow = require('../models/follow')

// MÉTODO DE PRUEBA ----------------------------------------------------------
function prueba (req, res) {
  res.status(200).send({message: 'Hola mundo desde el controlador follow'})
}

// MÉTODO SEGUIR A UN USUARIO ------------------------------------------------
function saveFollow (req, res) {
  var params = req.body

  var follow = new Follow()
  follow.user = req.user.sub // guarda el user del usuario identificado
  follow.followed = params.followed // guarda usuario al que sigue

  follow.save((err, followStored) => {
    if (err) return res.status(500).send({message: 'Error al guardar el seguimiento'})

    if (!followStored) return req.status(404).send({message: 'El seguimiento no se ha guardado'})

    return res.status(200).send({follow: followStored})
  })
}

// MÉTODO DEJA DE SEGUIR - UNFOLLOW

function deleteFollow (req, res) {
  var userId = req.user.sub
  var followId = req.params.id

  Follow.find({'user': userId, 'followed': followId}).remove(err => { // encuentra y borra al usuario de Follow que pase por URL
    if (err) return res.status(500).send({message: 'Error al dejar de seguir'})

    return res.status(200).send({message: 'El follow se ha eliminado'})
  })
}

module.exports = {
  prueba,
  saveFollow,
  deleteFollow
}
