'use strict'

var bcrypt = require('bcrypt-nodejs') // cargamos dependencia para cifrar contraseña
var jwt = require('../services/jwt') // cargamos el servicio
var mongoosePaginate = require('mongoose-pagination')
var fs = require('fs') // libreria file system de node que permine trabajar con archivos
var path = require('path') // permite trabajar con rutas del sistema de ficheros

var User = require('../models/user') // User en mayuscula para indicar que es un MODELO
var Follow = require('../models/follow') // Lo importamos para ver seguimientos en User
var Publication = require('../models/publication')

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
  // Cuando queramos recoger de URL es con params (GET)
  // Cuando queramos recoger de POST o PUT es con body

  User.findById(userId, (err, user) => {
    if (err) return res.status(500).send({message: 'Error en la petición'})

    if (!user) return res.status(404).send({message: 'El usuario no existe'})

    // Follow.findOne({'user': req.user.sub, 'followed': userId}).exec((err, follow) => {
    //  if (err) return res.status(500).send({message: 'Error al comprobar el seguimiento'})
    //  return res.status(200).send({user, follow})
    // })

    followThisUser(req.user.sub, userId).then((value) => {
      user.password = undefined
      return res.status(200).send({
        user,
        following: value.following,
        followed: value.followed
      })
    })
  })
}

async function followThisUser (identity_user_id, user_id) { // hago la funcion asíncrona
  var following = await Follow.findOne({'user': identity_user_id, 'followed': user_id}).exec((err, follow) => { // llamada síncrona
    if (err) return handleError(err)
    return follow
    // Guarda en la variable follow el resultado que hace el find, esperándose a que findone devuelva un resultado
  })
  var followed = await Follow.findOne({'user': user_id, 'followed': identity_user_id}).exec((err, follow) => { // llamada síncrona
    if (err) return handleError(err)
    return follow
  })
  return {
    following: following,
    followed: followed
  }
  // Al utilizar el async devuelve una promesa
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

    followUserIds(identity_user_id).then((value) => {
      return res.status(200).send({
        users,
        users_following: value.following,
        users_follow_me: value.followed,
        total,
        pages: Math.ceil(total / itemsPerPage)
      }) // promesa
    })
  })
}

// COMPROBAR SEGUMIENTOS - ARRAYS - C37 ---------------------------------------
async function followUserIds (user_id) { // await para esperar al return en vez de la variable
  var following = await Follow.find({'user': user_id}).select({'_id': 0, '__v': 0, 'user': 0}).exec((err, follows) => {
    return follows
  })
  // CUANDO NOS SIGUEN
  var followed = await Follow.find({'followed': user_id}).select({'_id': 0, '__v': 0, 'followed': 0}).exec((err, follows) => {
    return follows
  })

  // Procesar following ids
  var following_clean = []

  following.forEach((follow) => {
    following_clean.push(follow.followed)
  })

  // Procesar followed ids
  var followed_clean = []

  followed.forEach((follow) => {
    followed_clean.push(follow.user)
  })

  return {
    following: following_clean,
    followed: followed_clean
  }
}

// MÉTODO CONTADORES Y ESTADÍSTICAS -------------------------------------------

function getCounters (req, res) {
  var userId = req.user.sub
  if (req.params.id) {
    userId = req.params.id
  }
  getCountFollow(userId).then((value) => {
    return res.status(200).send(value) // value sera el count que habra hecho el método
  })
}
/*
async function getCountFollow (user_id) { // await va a esperar a que devuelva la llamada a la base de datos
  var following = await Follow.count({'user': user_id}).exec((err, count) => {
    if (err) return handleError(err)
    return count
    // Al tener que sacar varios datos
  })

  var followed = await Follow.count({'followed': user_id}).exec((err, count) => {
    if (err) return handleError(err)
    return count
  })

  var publications = await Publication.count({'user': user_id}).exec((err, count) => {
    if (err) return handleError(err)
    return count
  })

  return {
    following: following,
    followed: followed,
    publications: publications
  }
}
*/
// -------------------- S O L U C I O N ---------------------------------------

async function getCountFollow (user_id) {
  try {
    var following = await Follow.count({'user': user_id}).exec()
    .then(count => {
      return count
    })
    .catch((err) => {
      return handleError(err)
    })
    var followed = await Follow.count({'followed': user_id}).exec()
    .then(count => {
      return count
    })
    .catch((err) => {
      return handleError(err)
    })
    return {
      following: following,
      followed: followed
    }
  } catch (e) {
    console.log(e)
  }
}

// ACTUALIZAR DATOS DE UN USUARIOS --------------------------------------------
function updateUser (req, res) {
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

// SUBIR ARCHIVO IMAGEN-AVATAR DE USUARIO -------------------------------------
function uploadImage (req, res) {
  var userId = req.params.id

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

    if (userId !== req.user.sub) {
      return removeFilesOfUploads(res, file_path, 'No tienes permiso para actualizar los datos del usuario')
        // ponemos return para que la ejecución no siga por encima de removeFilesOfUploads
        // return res.status(500).send({message: 'No tienes permiso para actualizar los datos del usuario'})
    }

    if (file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif') {

      // Actualizar documento de usuario logeado
      User.findByIdAndUpdate(userId, {image: file_name}, {new: true}, (err, userUpdated) => {
        if (err) return res.status(500).send({message: 'Error en la petición'})

        if (!userUpdated) return res.status(404).send({message: 'No se ha podido actualizar el usuario'})

        return res.status(200).send({user: userUpdated})
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
  var path_file = './uploads/users/' + image_file

  fs.exists(path_file, (exists) => {
    if (exists) {
      res.sendFile(path.resolve(path_file))
    } else {
      res.status(200).send({message: 'No existe la imagen...'})
    }
  })
}

module.exports = {
  home,
  pruebas,
  saveUser,
  loginUser,
  getUser,
  getUsers,
  getCounters,
  updateUser,
  uploadImage,
  getImageFile
}

/*
1.Declaramos elementos(variables
2.Ajustes correspondientes /editar formato ruta, splits, borrar parametro contraseña..
3.Condicionales if..else,try..catch ...petición
4.Metemos el método con los parámetros y con posible callback
*/
