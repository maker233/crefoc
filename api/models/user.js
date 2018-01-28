'use strict'

var mongoose = require('mongoose')
var Schema = mongoose.Schema

var UserSchema = Schema({
  name: String,
  surname: String,
  nick: String,
  email: String,
  password: String,
  role: String,
  image: String
})

module.exports = mongoose.model('User', UserSchema) // "User" se guarda como "users"
// podemos exportar array, objeto, serie de objetos, un valor solo...
// en este caso el modelo de mongoose, llamamos a mongoogse y al metodo model
