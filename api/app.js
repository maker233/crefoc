'use strict'

var express = require('express')
var bodyParser = require('body-parser')

var app = express()

// cargar rutas
var user_routes = require('./routes/user')

// middlelwares
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

// cabeceras

// rutas
app.use('/api', user_routes)

/* CLIENTE HTTPS DE PRUEBA,
app.get('/', (req, res) => {
  res.status(200).send({
    message: 'Hola mundo desde el servidor de node.js'
  })
})

app.get('/pruebas', (req, res) => {
  res.status(200).send({
    message: 'Acción de pruebas en el servidor de node.js'
  })
})
*/

// exportar
module.exports = app
