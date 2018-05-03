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

// MÓDULO GUARDAR NUEVAS PUBLICACIONES ----------------------------------------
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

// MÉTODO DEVOLVER PUBLICACIONES QUE YO SIGO (TIMELINE)------------------------
function getPublications (req, res) {
  var page = 1 // al tener una paginacion asignamos primero la pagina defecto
  if (req.params.page) {
    page = req.params.page // Si llega paginación por URL la tomamos
  }
  var itemPerPage = 4

  Follow.find({user: req.user.sub}).populate('followed').exec((err, follows) => {
    // De los Id de usuarios de Follow, popula los que sean followed y ejecuta el callback
    if (err) return res.status(500).send({message: 'Error al devolver el seguimiento'})

    var follows_clean = []
    follows.forEach((follow) => {
      follows_clean.push(follow.followed) // metemos todos los usuarios dentrod e un array limpio
    })
    // console.log(follows_clean)
    // Quiero sacar las publicaciones cuyo usuario sea el que este dendro de la coleccion que tengo dentro de una variable
    Publication.find({user: {'$in': follows_clean}}).sort('-created_at').populate('user').paginate(page, itemsPerPage, (err, publications, total))
    if (err) return res.status(500).send({message: 'Error al devolver publicaciones'})

    if (!publications) return res.status(404).send({message: 'No hay publicaciones'})

    return res.status(200).send({
      total_items: total,
      pages: Math.ceil(total / itemsPerPage),
      page: page,
      publications
    })
  })
}

// MÉTODO DEVOLVER UNA PUBLICACIÓN --------------------------------------------
function getPublication (req, res) {
  var publicationId = req.params.id

  Publication.findById(publicationId, (err, publication) => {
    if (err) return res.status(500).send({message: 'Error al devolver la publicación'})

    if (!publication) return res.status(404).send({message: 'No existe la publicaciones'})

    return res.status(200).send({publication})
  })
}

// MÉTODO ELIMINAR PUBLICACIÓN ------------------------------------------------

function deletePublication (req, res) {
  var publicationId = req.params.id

  Publication.find({'user': req.user.sub, '_id': publicationId}).remove(err => {
    if (err) return res.status(500).send({message: 'Error al eliminar la publicación'})

    if (!publicationRemoved) return res.status(404).send({message: 'No se ha eliminado la publicaciones'})

    return res.status(200).send({message: 'Publicación eliminada'})
  })
}

// MÉTODO SUBIR IMÁGENES EN UNA PUBLICACIÓN -----------------------------------
function uploadImage (req, res) {
  var publicationId = req.params.id

  if (req.files) {
    var file_path = req.files.image.path
    console.log(file_path)

    var file_split = file_path.split('\\')
    console.log(file_split)

    var file_name = file_split[2]
    console.log(file_name)

    var ext_split = file_name.split('\.')
    console.log(ext_split)

    var file_ext = ext_split[1]
    console.log(file_ext)

    if (file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif') {

      // Comprobamos si la publicacion es del usuarios
      Publication.finOne({'user': req.user.sub, '_id': publicationId}).exec((err, publication) => {
        if (publication) {
          // Actualizar documento de LA PUBLICACIÓN
          Publication.findByIdAndUpdate(publicationId, {file: file_name}, {new: true}, (err, publicationUpdated) => {
            if (err) return res.status(500).send({message: 'Error en la petición!!'})

            if (!publicationUpdated) return res.status(404).send({message: 'No se ha podido actualizar la publicación'})

            return res.status(200).send({publication: publicationUpdated})
          })
        } else {
          return removeFilesOfUploads(res, file_path, 'No tienes permiso para actualizar esta publicación')
            // ponemos return para que la ejecución no siga por encima de removeFilesOfUploads
        }
      })
    } else {
      return removeFilesOfUploads(res, file_path, 'Extensión no válida')
      // ponemos return para que la ejecución no siga por encima de removeFilesOfUploads
    }
  } else {
    return res.status(200).send({message: 'No se ha subido ninguna imagen'})
  }
}

// FUNCIÓN AUXILIAR PARA ELIMINAR IMAGEN SUBIDA AL DAR ERROR ------------------
function removeFilesOfUploads (res, file_path, message) {
  fs.unlink(file_path, (err) => {
    return res.status(200).send({message: message})
      // Este método hace return y devuelve una respuesta pero la ejecución de uploadImage va a seguir, ponemos return por eso
  })
}

// RECUPERAR IMAGEN AVATAR ----------------------------------------------------
function getImageFile (req, res) {
  var image_file = req.params.imageFile
  var path_file = './uploads/publications/' + image_file

  fs.exists(path_file, (exists) => {
    if (exists) {
      res.sendFile(path.resolve(path_file))
    } else {
      res.status(200).send({message: 'No existe la imagen...'})
    }
  })
}

// MÉTODO VER PUBLICACIONES DE UNA CATEGORÍA --------------------- TEST NO VICTOR ---------------------------

function getPublicationCategory (req, res) {
  var image_file = req.params.imageFile
  var path_file = './uploads/publications/' + image_file

  fs.exists(path_file, (exists) => {
    if (exists) {
      res.sendFile(path.resolve(path_file))
    } else {
      res.status(200).send({message: 'No existe la imagen...'})
    }
  })
}

module.exports = {
  probando,
  savePublication,
  getPublications,
  getPublication,
  deletePublication,
  uploadImage,
  getImageFile
}
