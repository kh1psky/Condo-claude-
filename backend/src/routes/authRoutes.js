// backend/src/routes/authRoutes.js
const express = require('express');
const { authController } = require('../controllers');
const { usuarioSchema } = require('../utils/validationSchemas');
const { validate } = require('express-validator');
const { sensitiveRateLimiterMiddleware } = require('../middleware/rateLimiter');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registra um novo usuário
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - email
 *               - senha
 *               - cpf
 *             properties:
 *               nome:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               senha:
 *                 type: string
 *                 format: password
 *               cpf:
 *                 type: string
 *               telefone:
 *                 type: string
 *               tipo:
 *                 type: string
 *                 enum: [admin, sindico, morador]
 *     responses:
 *       201:
 *         description: Usuário registrado com sucesso
 *       400:
 *         description: Dados inválidos
 *       409:
 *         description: Email ou CPF já cadastrado
 */
router.post('/register', sensitiveRateLimiterMiddleware, usuarioSchema.create, validate(), authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Autentica um usuário
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - senha
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               senha:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *       401:
 *         description: Credenciais inválidas
 */
router.post('/login', sensitiveRateLimiterMiddleware, usuarioSchema.login, validate(), authController.login);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Solicita redefinição de senha
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Instruções enviadas (se o email existir)
 */
router.post('/forgot-password', sensitiveRateLimiterMiddleware, authController.forgotPassword);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Redefine a senha usando um token
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - senha
 *             properties:
 *               token:
 *                 type: string
 *               senha:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Senha redefinida com sucesso
 *       400:
 *         description: Token inválido ou expirado
 */
router.post('/reset-password', sensitiveRateLimiterMiddleware, authController.resetPassword);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Retorna o usuário autenticado
 *     tags: [Autenticação]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do usuário
 *       401:
 *         description: Não autenticado
 */
router.get('/me', authMiddleware, authController.me);

module.exports = router;
