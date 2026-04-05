const express = require("express");
const app = express();
const path = require("path");
const cors = require ("cors");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors()); 
app.use(express.static(path.join(__dirname, 'public')));


const AuthRoutes = require("./routes/usuarioRoutes");
app.use("/auth", AuthRoutes); 

const UsuarioController = require("./controllers/UsuarioController");

// app.get("/auth", UsuarioController.verificarAutenticacao, (req, res) => {
//   res.json({
//     mensagem:
//       "Você está logado com ID " +
//       req.usuarioId +
//       " e pode acessar este recurso",
//   });
// });


app.get(
  "/tipo",
  UsuarioController.verificarAutenticacao,
  UsuarioController.verificaIsAdmin,
  (req, res) => {
    res.json({
      mensagem: "Você é um administrador!",
    });
  }
);


app.listen(9000, () => {
  console.log("Aplicação rodando em http://localhost:9000");
});

module.exports = app;




