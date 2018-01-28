'use strict'

var bcrypt = require('bcrypt-nodejs') // cargamos dependencia para cifrar contraseña
var User = require('../models/user') // User en mayuscula para indicar que es un MODELO

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
  } else {
    res.status(200).send({
      message: 'Envía todos los campos necesarios'
    })
  }
}

module.exports = {
  home,
  pruebas,
  saveUser
}
