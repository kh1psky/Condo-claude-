// backend/src/routes/condominioRoutes.js
const express = require('express');
const { condominioController } = require('../controllers');
const { condominioSchema, idParam, paginationQuery } = require('../utils/validationSchemas');
const { validate } = require('express-validator');
const { authMiddleware, isAdmin, isAdminOrSindico } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /condominios:
 *   get:
 *     summary: Lista todos os condomínios
 *     tags: [Condomínios]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ativo, inativo]
 *     responses:
 *       200:
 *         description: Lista de condomínios
 *       401:
 *         description: Não autenticado
 */
router.get('/', authMiddleware, paginationQuery, validate(), condominioController.listarCondominios);

/**
 * @swagger
 * /condominios/{id}:
 *   get:
 *     summary: Busca um condomínio pelo ID
 *     tags: [Condomínios]
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
 *         description: Dados do condomínio
 *       404:
 *         description: Condomínio não encontrado
 */
router.get('/:id', authMiddleware, idParam, validate(), condominioController.buscarCondominio);

/**
 * @swagger
 * /condominios:
 *   post:
 *     summary: Cria um novo condomínio
 *     tags: [Condomínios]
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
 *               - endereco
 *               - cidade
 *               - estado
 *               - cep
 *               - cnpj
 *             properties:
 *               nome:
 *                 type: string
 *               endereco:
 *                 type: string
 *               cidade:
 *                 type: string
 *               estado:
 *                 type: string
 *               cep:
 *                 type: string
 *               cnpj:
 *                 type: string
 *               email_contato:
 *                 type: string
 *                 format: email
 *               telefone_contato:
 *                 type: string
 *               data_inauguracao:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Condomínio criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       409:
 *         description: CNPJ já cadastrado
 */
router.post('/', authMiddleware, isAdmin, condominioSchema.create, validate(), condominioController.criarCondominio);

/**
 * @swagger
 * /condominios/{id}:
 *   put:
 *     summary: Atualiza um condomínio
 *     tags: [Condomínios]
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
 *               endereco:
 *                 type: string
 *               cidade:
 *                 type: string
 *               estado:
 *                 type: string
 *               cep:
 *                 type: string
 *               cnpj:
 *                 type: string
 *               email_contato:
 *                 type: string
 *                 format: email
 *               telefone_contato:
 *                 type: string
 *               data_inauguracao:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [ativo, inativo]
 *     responses:
 *       200:
 *         description: Condomínio atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Condomínio não encontrado
 *       409:
 *         description: CNPJ já cadastrado
 */
router.put('/:id', authMiddleware, isAdminOrSindico, idParam, condominioSchema.update, validate(), condominioController.atualizarCondominio);

/**
 * @swagger
 * /condominios/{id}:
 *   delete:
 *     summary: Remove um condomínio (soft delete)
 *     tags: [Condomínios]
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
 *         description: Condomínio removido com sucesso
 *       404:
 *         description: Condomínio não encontrado
 *       409:
 *         description: Não é possível remover o condomínio pois existem unidades associadas a ele
 */
router.delete('/:id', authMiddleware, isAdmin, idParam, validate(), condominioController.removerCondominio);

module.exports = router;