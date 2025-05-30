// backend/src/routes/dashboardRoutes.js
const express = require('express');
const { dashboardController } = require('../controllers');
const { validate } = require('express-validator');
const { authMiddleware, isAdminOrSindico } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /dashboard:
 *   get:
 *     summary: Obtém dados do dashboard
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: condominio_id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Dados do dashboard
 *       400:
 *         description: ID do condomínio não fornecido
 *       404:
 *         description: Condomínio não encontrado
 */
router.get('/', authMiddleware, isAdminOrSindico, validate(), dashboardController.getDashboardData);

module.exports = router;