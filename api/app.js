'use strict'

var express = require('express')
var bodyParser = require('body-parser')

var app = express()

// cargar rutas
var user_routes = require('./routes/user')
var follow_routes = require('./routes/follow')
var publication_routes = require('./routes/publication')
var message_routes = require('./routes/message')

// middlelwares
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

// cabeceras o cors
// configurar cabeceras http
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method')
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE')
  res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE')

  next()
})
// rutas - podríamos dejarlo en '/'
app.use('/api', user_routes) // se añade un /api antes de las rutas
app.use('/api', follow_routes)
app.use('/api', publication_routes)
app.use('/api', message_routes)

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
