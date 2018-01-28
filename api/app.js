'use strict'

var express = require('express')
var bodyParser = require('body-parser')

var app = express()

// cargar rutas
var user_routes = require('./routes/user')

// middlelwares
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

// cabeceras o cors

// rutas
app.use('/api', user_routes) // se añade un /api antes de las rutas

/* CLIENTE HTTPS DE PRUEBA,
app.get('/', (req, res) => {
  res.status(200).send({
    message: 'Hola mundo desde el servidor de node.js'
  })
})

app.get('/pruebas', (req, res) => {
  console.log(req.body)
  res.status(200).send({
    message: 'Acción de pruebas en el servidor de node.js'
  })
})
*/

// exportar
module.exports = app
