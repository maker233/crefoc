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

// MÉTODO LISTAR USUARIOS QUE SIGO

function getFollowingUsers (req, res) {
  var userId = req.user.sub

  if (req.params.id && req.param.page) {
    userId = req.params.id
  }
  var page = 1

  if (req.params.page) {
    page = req.params.page
  } else {
    page = req.params.id
  }

  var itemsPerPage = 4

  Follow.find({user: userId}).populate({path: 'followed'}).paginate(page, itemsPerPage, (err, follows, total) => {
    if (err) return res.status(500).send({message: 'Error al dejar de seguir'})

    if (!follows) return res.status(404).send({message: 'No estas siguiendo a ningún usuario'})

    return res.status(200).send({
      total: total,
      pages: Math.ceil(total / itemsPerPage),
      follows
    })
  })
}

// MÉTODO LISTAR USUARIOS QUE ME SIGUEN

function getFollowedUsers (req, res) {
  var userId = req.user.sub

  if (req.params.id && req.param.page) {
    userId = req.params.id
  }
  var page = 1

  if (req.params.page) {
    page = req.params.page
  } else {
    page = req.params.id
  }

  var itemsPerPage = 4

  Follow.find({followed: userId}).populate('user').paginate(page, itemsPerPage, (err, follows, total) => {
    if (err) return res.status(500).send({message: 'Error en el servidor'})

    if (!follows) return res.status(404).send({message: 'No te sigue ningún usuario'})

    return res.status(200).send({
      total: total,
      pages: Math.ceil(total / itemsPerPage),
      follows
    })
  })
}

// MÉTODO DEVOLVER LISTADOS USUARIOS QUE SIGO Y ME SIGUEN
function getMyFollows (req, res) {
  var userId = req.user.sub

  var find = Follow.find({user: userId})

  if (req.params.followed) {
    find = Follow.find({followed: userId})
  }

  find.populate('user followed').exec((err, follows) => {
    if (err) return res.status(500).send({message: 'Error en el servidor'})

    if (!follows) return res.status(404).send({message: 'No sigues a ningún usuario'})

    return res.status(200).send({follows})
  })
}

module.exports = {
  prueba,
  saveFollow,
  deleteFollow,
  getFollowingUsers,
  getFollowedUsers,
  getMyFollows
}
