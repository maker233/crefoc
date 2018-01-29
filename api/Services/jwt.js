'use strict'
// CREACIÓN TOKEN DE LOGIN
var jwt = require('jwt-simple')
var moment = require('moment')
var secret = 'clave_secreta_creative_focus_estudio_seo'

exports.createToken = function (user) {
  var payload = { // contenido del token
    sub: user._id,
    name: user.name,
    surname: user.surname,
    nick: user.nick,
    email: user.email,
    role: user.role,
    image: user.image,
    iat: moment().unix(),
    exp: moment().add(30, 'days').unix // expiración
  }

  return jwt.encode(payload, secret)
}
