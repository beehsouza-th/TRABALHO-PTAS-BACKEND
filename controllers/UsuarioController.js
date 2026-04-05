const { PrismaClient } = require('@prisma/client');
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();

class UsuarioController {

    //  CADASTRO 
    static async cadastrar(req, res) {
        const { nome, email, password } = req.body;

        if (!nome || !email || !password) {
            return res.status(400).json({
                mensagem: "Campos obrigatórios faltando",
                erro: true
            });
        }

        // Verificar se usuário já existe
        const usuarioExistente = await prisma.usuario.findUnique({ where: { email } });
        if (usuarioExistente) {
            return res.status(400).json({
                mensagem: "E-mail já existe",
                erro: true
            });
        }

        // Criar usuário
        const salt = bcryptjs.genSaltSync(8);
        const hashSenha = bcryptjs.hashSync(password, salt);

        const usuario = await prisma.usuario.create({
            data: {
                nome,
                email,
                password: hashSenha,
                tipo: "cliente"  // ou "admin"
            }
        });

        return res.status(201).json({
            usuarioId: usuario.id,
            mensagem: "Usuário cadastrado com sucesso",
            erro: false
        });
    }

    // LOGIN 
    static async login(req, res) {
   const { email, password } = req.body;

  // Validação de campos obrigatórios
  if (!email || !password) {
    return res.status(400).json({
      mensagem: "Campos obrigatórios faltando",
      erro: true
    });
  }

  const usuario = await prisma.usuario.findUnique({ where: { email } });

  if (!usuario) {
    return res.status(401).json({
      mensagem: "Desculpe :( usuário não encontrado!",
      erro: true
    });
  }

  const senhaCorreta = bcryptjs.compareSync(password, usuario.password);
  if (!senhaCorreta) {
    return res.status(401).json({
      mensagem: "Sua senha está incorreta",
      erro: true
    });
  }

  const token = jwt.sign({ id: usuario.id }, process.env.SENHA_TOKEN, { expiresIn: "1h" });

  return res.status(200).json({
    mensagem: "Pronto! Você foi autenticado com sucesso!",
    erro: false,
    token
  });
}

    // MIDDLEWARE AUTENTICAÇÃO 
    static async verificarAutenticacao(req, res, next) {
        const auth = req.headers["authorization"];

        if (!auth) {
            return res.status(401).json({
                mensagem: "Token não encontrado",
                erro: true
            });
        }

        const token = auth.split(" ")[1];
        jwt.verify(token, process.env.SENHA_TOKEN, (err, payload) => {
            if (err) {
                return res.status(401).json({
                    mensagem: "Seu token é inválido, tente novamente",
                    erro: true
                });
            }
            req.usuarioId = payload.id;
            next();
        });
    }

    // MIDDLEWARE ADMIN 
    static async verificaIsAdmin(req, res, next) {
        if (!req.usuarioId) {
            return res.status(401).json({
                mensagem: "Você não está autenticado!",
                erro: true
            });
        }

        const usuario = await prisma.usuario.findUnique({ where: { id: req.usuarioId } });

        if (!usuario.tipo || usuario.tipo.toLowerCase() !== "admin") {
            return res.status(403).json({
                mensagem: "Acesso negado! Você não é um administrador",
                erro: true
            });
        }

        next();
    }
}

module.exports = UsuarioController;
