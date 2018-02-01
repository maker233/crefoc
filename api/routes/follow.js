'use strict'

var express = require('express')
var FollowController = require('../controllers/follow')
var api = express.Router()
var md_auth = require('../middlewares/authenticated')

api.get('/pruebas-follow', md_auth.ensureAuth, FollowController.prueba)
api.get('/following/:id?/:page?', md_auth.ensureAuth, FollowController.getFollowingUsers) // sigo
api.get('/followed/:id?/:page?', md_auth.ensureAuth, FollowController.getFollowedUsers) // me siguen
api.get('/get-my-follows/:followed?', md_auth.ensureAuth, FollowController.getMyFollows) // me siguen

api.post('/follow', md_auth.ensureAuth, FollowController.saveFollow)

api.delete('/follow/:id', md_auth.ensureAuth, FollowController.deleteFollow)

module.exports = api
