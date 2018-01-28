'use strict'

var mongoose = require('mongoose')
var Schema = mongoose.Schema

var PublicationSchema = Schema({ // schema es un método o un objeto que tiene un parámetro
  user: { type: Schema.ObjectId, ref: 'User' },
  text: String,
  file: String,
  created_at: String
})

module.exports = mongoose.model('Publication', PublicationSchema)
