'use strict'

var bcrypt = require('bcrypt-nodejs') // cargamos dependencia para cifrar contraseña
var User = require('../models/user') // User en mayuscula para indicar que es un MODELO
var jwt = require('../services/jwt') // cargamos el servicio
var mongoosePaginate = require('mongoose-pagination')
var fs = require('fs') // libreria file system de node que permine trabajar con archivos
var path = require('path')// permite trabajar con rutas del sistema de ficheros

// MÉTODOS DE PRUEBA ----------------------------------------------------------
function home (req, res) {
  res.status(200).send({
    message: 'Hola mundo desde el servidor de node.js'
  })
}

function pruebas (req, res) {
  console.log(req.body)
  res.status(200).send({
    message: 'Acción de pruebas en el servidor de node.js'
  })
}

// REGISTRO DE USUARIOS -------------------------------------------------------
function saveUser (req, res) {
  var params = req.body // recojer los parametros de la req (petición), todos los campos que lleguen por POST los recoge en estra variable
  var user = new User()

  if (params.name && params.surname &&
    params.nick && params.email && params.password) { // y seteamos los params a las propiedades del objeto usuario
    // console.log(req.body)

    user.name = params.name
    user.surname = params.surname
    user.nick = params.nick
    user.email = params.email
    user.role = 'ROLE_USER'
    user.image = null
    // user.password = params.password // SIN CIFRAR

    // CONTROLAR USUARIOS DUPLICADOS ------------------------------------------
    User.find({ $or: [
                    {email: user.email.toLowerCase()},
                    {nick: user.nick.toLowerCase()}
    ]}).exec((err, users) => {
      if (err) return res.status(500).send({message: 'Error en la petición de usuarios'})

      if (users && users.length >= 1) {
        return res.status(500).send({message: 'El usuario que intentas registrar ya existe'})
      } else {
        // CIFRADO DE PASSWORD Y GUARDADO DE DATOS ----------------------------
        bcrypt.hash(params.password, null, null, (err, hash) => {
          user.password = hash
          if (err) return res.status(500).send({message: 'Error de cifrado'})
          console.log(req.body)
          user.save((err, userStored) => { // modelo save mongoose guardar
            if (err) return res.status(500).send({message: 'Error al guardar el usuario!'})
            if (userStored) {
              res.status(200).send({user: userStored})
            } else {
              res.status(404).send({message: 'No se ha registrado el usuario'})
            }
          })
        })
      }
    })
  } else {
    res.status(200).send({
      message: 'Envía todos los campos necesarios'
    })
  }
}

// LOGIN DE USUARIOS ----------------------------------------------------------
function loginUser (req, res) {
  var params = req.body

  var email = params.email
  var password = params.password

  User.findOne({email: email}, (err, user) => {
    if (err) return res.status(500).send({message: 'Error en la petición'})
    if (user) {
      bcrypt.compare(password, user.password, (err, check) => {
        if (err) {
          res.status(404).send({message: 'La sesión no es válida'})
        }
        if (check) {
          if (params.gettoken) { // si viene con token -gettoken: true- devuelve el token
            // Generar y devolver token, lo generamos con el servicio jwt.js
            return res.status(200).send({
              token: jwt.createToken(user)
            })
          } else {
            // Devolver datos de usuarios -------------
            user.password = undefined // Eliminamos la propiedad para que sea interno del backend y no la devuelva por post
            return res.status(200).send({user})
          }
        } else {
          return res.status(404).send({message: 'El email o la contraseña no son correctas'})
        }
      })
    } else { // Cuando el usuario no exista
      return res.status(404).send({message: 'El usuario no se ha podido identificar!'})
    }
  })
}

// CONSEGUIR DATOS DE UN USUARIOS ---------------------------------------------
function getUser (req, res) {
  var userId = req.params.id
  // Cuando queramos recoger de URL es con params
  // Cuando queramos recoger de POST o PUT es con body

  User.findById(userId, (err, user) => {
    if (err) return res.status(500).send({message: 'Error en la petición'})

    if (!user) return res.status(404).send({message: 'El usuario no existe'})

    return res.status(200).send({user})
  })
}

// DEVOLVER UN LISTADO DE USUARIOS PAGINADOS ----------------------------------
function getUsers (req, res) {
  var identity_user_id = req.user.sub // id del usuario logeado, tenemos req.user bindeaba en el middleware

  var page = 1
  if (req.params.page) {
    page = req.params.page
  }

  var itemsPerPage = 5

  User.find().sort('_id').paginate(page, itemsPerPage, (err, users, total) => { // sort ordena
    if (err) return res.status(500).send({message: 'Error en la petición'})

    if (!users) return res.status(404).send({message: 'No hay usuarios disponibles'})

    return res.status(200).send({
      users,
      total,
      pages: Math.ceil(total / itemsPerPage)
    })
  })
}

// ACTUALIZAR DATOS DE UN USUARIOS --------------------------------------------
function updateUser(req,res) {
  var userId = req.params.id
  var update = req.body

  // Borrar propiedad PASSWORD
  delete update.password

  if (userId !== req.user.sub) {
    return res.status(500).send({message: 'No tienes permiso para actualizar los datos del usuario'})
  }

  User.findByIdAndUpdate(userId, update, {new: true}, (err, userUpdated) => {
    if (err) return res.status(500).send({message: 'Error en la petición'})

    if (!userUpdated) return res.status(404).send({message: 'No se ha podido actualizar el usuario'})

    return res.status(200).send({user: userUpdated})
  })
}

// SUBIR ARCHIVO IMAGEN-AVATAR DE USUARIO
function uploadImage (req, res) {
  var userId = req.params.id

  if (userId !== req.user.sub) {
    return res.status(500).send({message: 'No tienes permiso para actualizar los datos del usuario'})
  }

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
      // Actualizar documento de usuario logeado

    }else{
      fs.unlink(filepath), (err) => {

      if (err) return.status(200).send({'Extensión no válida'})
    }}

  } else {
    return res.status(200).send({message: 'No se ha subido ninguna imagen'})
  }
}

module.exports = {
  home,
  pruebas,
  saveUser,
  loginUser,
  getUser,
  getUsers,
  updateUser,
  uploadImage
}
