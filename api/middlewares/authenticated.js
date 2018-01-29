'use strict'
// DECODIFICA EL TOKEN, COMPRUEBA VALIDEZ
var jwt = require('jwt-simple')
var moment = require('moment')
var secret = 'clave_secreta_creative_focus_estudio_seo'

exports.ensureAuth = function (req, res, next) {
  if (!req.headers.authorization) { // comprobamos token
    return res.status(403).send({message: 'La petición no tiene la cabecera de autenticación'})
  }
  var token = req.headers.authorization.replace(/['"]+/g, '') // limpiamos comillas del token

  try { // los token suelen fallar, usamos try-catch
    var payload = jwt.decode(token, secret) // DECODIFICA

    if (payload.exp <= moment().unix()) { // comprueba si la fecha expiación es anterior a momento actual
      return res.status(401).send({
        message: 'El token ha expirado'
      })
    }
  } catch (ex) {
    return res.status(404).send({
      message: 'El token no es válido'
    })
  }
  req.user = payload // adjuntamos el payload a la request para tener siempre dentro de los controladores el objeto del usuario logeado
                    // en los controladores tengo acceso a req.user y tengo dentro todos los datos del usuario que esta enviando el token
  next()
}
