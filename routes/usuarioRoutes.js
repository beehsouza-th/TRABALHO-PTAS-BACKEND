const express = require ("express");
const router = express.Router();
const UsuarioController = require("../controllers/UusuarioController");

//rota de cadastro
router.post("/cadastrar", UsuarioController.cadastrar);

//rota de login
router.post("/login", UsuarioController.login);

module.exports = router