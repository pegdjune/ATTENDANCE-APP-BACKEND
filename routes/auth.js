const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const User = require('../models/User')
const verifyAuth = require('../middleware/VerifyAuth')
const { token } = require('morgan')

const controller = require("../controllers/controller")

// POST pour la route /api/v1/register
router.post('/register' , controller.CreateUser )


// POST pour la route Login 
router.post('/login', controller.LoginUser)


// GET api/v1/user | private | get logged in user for the process of auth
router.get('/user', verifyAuth,  controller.GetUser)

// CONNEXION POUR ADMINISTRATEUR
router.post('/admin', controller.LoginAdmin)

// MISE A JOUR PASSWORD ADMIN
router.post('/update-admin', controller.UpdateAdmin)

// MISE A JOUR MOT DE PASSE UTILISATEUR
router.post('/update-user', controller.UpdateUser)

// SUPPRESSION UTILISATEUR
router.delete('/delete-user/:userId', controller.DeleteUser)

module.exports = router