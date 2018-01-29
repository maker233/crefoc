'use strict'

var bcrypt = require('bcrypt-nodejs') // cargamos dependencia para cifrar contraseña
var User = require('../models/user') // User en mayuscula para indicar que es un MODELO
var jwt = require('../services/jwt') // cargamos el servicio

// rutas
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

// crear nuevos usuarios
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

module.exports = {
  home,
  pruebas,
  saveUser,
  loginUser
}
