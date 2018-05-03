'use strict'

var mongoose = require('mongoose')
var app = require('./app')
var port = 3800

// Conexión DDBB
mongoose.Promise = global.Promise
mongoose.connect('mongodb://localhost:27017/creativefocus') //, {useMongoClient: true}) // conexion a base de datos
  .then(() => {
    console.log('La conexión a la base de datos creativefocus se ha realizado correctamente')

    // crear servidor
    app.listen(port, () => {
      console.log('Servidor corriendo en http://localhost:3800')
    })
  })
  .catch(err => console.log(err))
