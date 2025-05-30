// backend/src/routes/usuarioRoutes.js
const express = require('express');
const { usuarioController } = require('../controllers');
const { usuarioSchema, idParam, paginationQuery } = require('../utils/validationSchemas');
const { validate } = require('express-validator');
const { authMiddleware, isAdmin, isOwnerOrAdmin } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /usuarios:
 *   get:
 *     summary: Lista todos os usuários
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: pagina
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: busca
 *         schema:
 *           type: string
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [admin, sindico, morador]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ativo, inativo]
 *     responses:
 *       200:
 *         description: Lista de usuários
 *       401:
 *         description: Não autenticado
 */
router.get('/', authMiddleware, isAdmin, paginationQuery, validate(), usuarioController.listarUsuarios);

/**
 * @swagger
 * /usuarios/{id}:
 *   get:
 *     summary: Busca um usuário pelo ID
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Dados do usuário
 *       404:
 *         description: Usuário não encontrado
 */
router.get('/:id', authMiddleware, isOwnerOrAdmin('id'), idParam, validate(), usuarioController.buscarUsuario);

/**
 * @swagger
 * /usuarios:
 *   post:
 *     summary: Cria um novo usuário
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
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
 *         description: Usuário criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       409:
 *         description: Email ou CPF já cadastrado
 */
router.post('/', authMiddleware, isAdmin, usuarioSchema.create, validate(), usuarioController.criarUsuario);

/**
 * @swagger
 * /usuarios/{id}:
 *   put:
 *     summary: Atualiza um usuário
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               senha:
 *                 type: string
 *                 format: password
 *               telefone:
 *                 type: string
 *               tipo:
 *                 type: string
 *                 enum: [admin, sindico, morador]
 *               status:
 *                 type: string
 *                 enum: [ativo, inativo]
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Usuário não encontrado
 *       409:
 *         description: Email já cadastrado
 */
router.put('/:id', authMiddleware, isOwnerOrAdmin('id'), idParam, usuarioSchema.update, validate(), usuarioController.atualizarUsuario);

/**
 * @swagger
 * /usuarios/{id}:
 *   delete:
 *     summary: Remove um usuário (soft delete)
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Usuário removido com sucesso
 *       404:
 *         description: Usuário não encontrado
 *       409:
 *         description: Não é possível remover o usuário pois existem unidades associadas a ele
 */
router.delete('/:id', authMiddleware, isAdmin, idParam, validate(), usuarioController.removerUsuario);

module.exports = router;