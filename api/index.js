'use strict'

var mongoose = require('mongoose')

mongoose.Promise = global.Promise
mongoose.connect('mongodb://localhost:27017/creativefocus') //, {useMongoClient: true}) // conexion a base de datos
    .then(() => {
      console.log('La conexión a la base de datos se ha realizado correctamente')
    })
    .catch(err => console.log(err))
