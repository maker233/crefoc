'use strict'

var jwt = require('jwt-simple')
var moment = require('moment')
var secret = 'clave_secreta_creative_focus_estudio_seo'

exports.ensureAuth = function (req, res, next) {
  if (!req.headers.authorization) { // comprobamos token
    return res.status(403).send({message: 'La petición no tiene la cabecera de autenticación'})
  }
  var token = req.headers.authorization.replace(/['"]+/g, '') // limpiamos comillas del token

  try { // los token suelen fallar, usamos try-catch
    var payload = jwt.decode(token, secret)

    if (payload.exp <= moment().unix()) {
      return res.status(401).send({
        message: 'El token ha expirado'
      })
    }
  } catch (ex) {
    return res.status(404).send({
      message: 'El token no es válido'
    })
  }
  req.user = payload
}
