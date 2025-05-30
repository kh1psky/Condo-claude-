// backend/src/utils/validationSchemas.js
const { body, param, query } = require('express-validator');
const { isValidCPF, isValidCNPJ, isValidTelefone, isValidCEP } = require('./validators');

/**
 * Schemas de validação para as requisições
 */

// Validações de Usuário
exports.usuarioSchema = {
  create: [
    body('nome')
      .notEmpty().withMessage('O nome é obrigatório')
      .isLength({ min: 3, max: 100 }).withMessage('O nome deve ter entre 3 e 100 caracteres'),
    
    body('email')
      .notEmpty().withMessage('O e-mail é obrigatório')
      .isEmail().withMessage('Informe um e-mail válido')
      .normalizeEmail(),
    
    body('senha')
      .notEmpty().withMessage('A senha é obrigatória')
      .isLength({ min: 6 }).withMessage('A senha deve ter pelo menos 6 caracteres'),
    
    body('cpf')
      .notEmpty().withMessage('O CPF é obrigatório')
      .custom(value => {
        if (!isValidCPF(value)) {
          throw new Error('CPF inválido');
        }
        return true;
      }),
    
    body('telefone')
      .optional()
      .custom(value => {
        if (value && !isValidTelefone(value)) {
          throw new Error('Telefone inválido');
        }
        return true;
      }),
    
    body('tipo')
      .optional()
      .isIn(['admin', 'sindico', 'morador']).withMessage('Tipo de usuário inválido')
  ],
  
  update: [
    body('nome')
      .optional()
      .isLength({ min: 3, max: 100 }).withMessage('O nome deve ter entre 3 e 100 caracteres'),
    
    body('email')
      .optional()
      .isEmail().withMessage('Informe um e-mail válido')
      .normalizeEmail(),
    
    body('senha')
      .optional()
      .isLength({ min: 6 }).withMessage('A senha deve ter pelo menos 6 caracteres'),
    
    body('telefone')
      .optional()
      .custom(value => {
        if (value && !isValidTelefone(value)) {
          throw new Error('Telefone inválido');
        }
        return true;
      }),
    
    body('status')
      .optional()
      .isIn(['ativo', 'inativo']).withMessage('Status inválido')
  ],
  
  login: [
    body('email')
      .notEmpty().withMessage('O e-mail é obrigatório')
      .isEmail().withMessage('Informe um e-mail válido')
      .normalizeEmail(),
    
    body('senha')
      .notEmpty().withMessage('A senha é obrigatória')
  ]
};

// Validações de Condomínio
exports.condominioSchema = {
  create: [
    body('nome')
      .notEmpty().withMessage('O nome é obrigatório')
      .isLength({ min: 3, max: 100 }).withMessage('O nome deve ter entre 3 e 100 caracteres'),
    
    body('endereco')
      .notEmpty().withMessage('O endereço é obrigatório'),
    
    body('cidade')
      .notEmpty().withMessage('A cidade é obrigatória'),
    
    body('estado')
      .notEmpty().withMessage('O estado é obrigatório')
      .isLength({ min: 2, max: 2 }).withMessage('O estado deve ter 2 caracteres (UF)'),
    
    body('cep')
      .notEmpty().withMessage('O CEP é obrigatório')
      .custom(value => {
        if (!isValidCEP(value)) {
          throw new Error('CEP inválido');
        }
        return true;
      }),
    
    body('cnpj')
      .notEmpty().withMessage('O CNPJ é obrigatório')
      .custom(value => {
        if (!isValidCNPJ(value)) {
          throw new Error('CNPJ inválido');
        }
        return true;
      }),
    
    body('email_contato')
      .optional()
      .isEmail().withMessage('Informe um e-mail válido')
      .normalizeEmail(),
    
    body('telefone_contato')
      .optional()
      .custom(value => {
        if (value && !isValidTelefone(value)) {
          throw new Error('Telefone inválido');
        }
        return true;
      }),
    
    body('data_inauguracao')
      .optional()
      .isDate().withMessage('Informe uma data válida')
  ],
  
  update: [
    body('nome')
      .optional()
      .isLength({ min: 3, max: 100 }).withMessage('O nome deve ter entre 3 e 100 caracteres'),
    
    body('email_contato')
      .optional()
      .isEmail().withMessage('Informe um e-mail válido')
      .normalizeEmail(),
    
    body('telefone_contato')
      .optional()
      .custom(value => {
        if (value && !isValidTelefone(value)) {
          throw new Error('Telefone inválido');
        }
        return true;
      }),
    
    body('status')
      .optional()
      .isIn(['ativo', 'inativo']).withMessage('Status inválido')
  ]
};

// Validações de Unidade
exports.unidadeSchema = {
  create: [
    body('numero')
      .notEmpty().withMessage('O número da unidade é obrigatório')
      .isLength({ max: 20 }).withMessage('O número deve ter no máximo 20 caracteres'),
    
    body('condominio_id')
      .notEmpty().withMessage('O condomínio é obrigatório')
      .isInt().withMessage('ID de condomínio inválido'),
    
    body('usuario_id')
      .optional()
      .isInt().withMessage('ID de usuário inválido'),
    
    body('bloco')
      .optional()
      .isLength({ max: 20 }).withMessage('O bloco deve ter no máximo 20 caracteres'),
    
    body('andar')
      .optional()
      .isInt().withMessage('Andar inválido'),
    
    body('tipo')
      .optional()
      .isIn(['apartamento', 'casa', 'comercial', 'outro']).withMessage('Tipo de unidade inválido'),
    
    body('area_privativa')
      .optional()
      .isFloat({ min: 0 }).withMessage('Área privativa inválida'),
    
    body('fracao_ideal')
      .optional()
      .isFloat({ min: 0, max: 1 }).withMessage('Fração ideal inválida (deve ser entre 0 e 1)'),
    
    body('status')
      .optional()
      .isIn(['ocupado', 'vazio', 'em_obras']).withMessage('Status inválido'),
    
    body('valor_base_condominio')
      .optional()
      .isFloat({ min: 0 }).withMessage('Valor base inválido')
  ],
  
  update: [
    body('usuario_id')
      .optional()
      .isInt().withMessage('ID de usuário inválido'),
    
    body('status')
      .optional()
      .isIn(['ocupado', 'vazio', 'em_obras']).withMessage('Status inválido'),
    
    body('valor_base_condominio')
      .optional()
      .isFloat({ min: 0 }).withMessage('Valor base inválido')
  ]
};

// Validações de Pagamento
exports.pagamentoSchema = {
  create: [
    body('unidade_id')
      .notEmpty().withMessage('A unidade é obrigatória')
      .isInt().withMessage('ID de unidade inválido'),
    
    body('tipo')
      .optional()
      .isIn(['condominio', 'extra', 'multa', 'outro']).withMessage('Tipo de pagamento inválido'),
    
    body('descricao')
      .notEmpty().withMessage('A descrição é obrigatória')
      .isLength({ max: 255 }).withMessage('A descrição deve ter no máximo 255 caracteres'),
    
    body('valor')
      .notEmpty().withMessage('O valor é obrigatório')
      .isFloat({ min: 0 }).withMessage('Valor inválido'),
    
    body('data_vencimento')
      .notEmpty().withMessage('A data de vencimento é obrigatória')
      .isDate().withMessage('Data de vencimento inválida'),
    
    body('data_pagamento')
      .optional()
      .isDate().withMessage('Data de pagamento inválida'),
    
    body('status')
      .optional()
      .isIn(['pendente', 'pago', 'atrasado', 'cancelado']).withMessage('Status inválido'),
    
    body('referencia_mes')
      .optional()
      .isInt({ min: 1, max: 12 }).withMessage('Mês de referência inválido'),
    
    body('referencia_ano')
      .optional()
      .isInt({ min: 2000, max: 2100 }).withMessage('Ano de referência inválido')
  ],
  
  update: [
    body('data_pagamento')
      .optional()
      .isDate().withMessage('Data de pagamento inválida'),
    
    body('status')
      .optional()
      .isIn(['pendente', 'pago', 'atrasado', 'cancelado']).withMessage('Status inválido')
  ]
};

// Validações de Manutenção
exports.manutencaoSchema = {
  create: [
    body('titulo')
      .notEmpty().withMessage('O título é obrigatório')
      .isLength({ max: 100 }).withMessage('O título deve ter no máximo 100 caracteres'),
    
    body('descricao')
      .notEmpty().withMessage('A descrição é obrigatória'),
    
    body('local')
      .notEmpty().withMessage('O local é obrigatório'),
    
    body('condominio_id')
      .notEmpty().withMessage('O condomínio é obrigatório')
      .isInt().withMessage('ID de condomínio inválido'),
    
    body('usuario_solicitante_id')
      .notEmpty().withMessage('O solicitante é obrigatório')
      .isInt().withMessage('ID de usuário inválido'),
    
    body('tipo')
      .optional()
      .isIn(['preventiva', 'corretiva', 'emergencial']).withMessage('Tipo de manutenção inválido'),
    
    body('prioridade')
      .optional()
      .isIn(['baixa', 'media', 'alta', 'critica']).withMessage('Prioridade inválida'),
    
    body('fornecedor_id')
      .optional()
      .isInt().withMessage('ID de fornecedor inválido'),
    
    body('custo_estimado')
      .optional()
      .isFloat({ min: 0 }).withMessage('Custo estimado inválido')
  ],
  
  update: [
    body('status')
      .optional()
      .isIn(['solicitada', 'aprovada', 'em_andamento', 'concluida', 'cancelada']).withMessage('Status inválido'),
    
    body('data_aprovacao')
      .optional()
      .isDate().withMessage('Data de aprovação inválida'),
    
    body('data_inicio')
      .optional()
      .isDate().withMessage('Data de início inválida'),
    
    body('data_conclusao')
      .optional()
      .isDate().withMessage('Data de conclusão inválida'),
    
    body('custo_real')
      .optional()
      .isFloat({ min: 0 }).withMessage('Custo real inválido'),
    
    body('fornecedor_id')
      .optional()
      .isInt().withMessage('ID de fornecedor inválido')
  ]
};

// Validações genéricas para IDs
exports.idParam = param('id')
  .notEmpty().withMessage('ID é obrigatório')
  .isInt().withMessage('ID inválido');

exports.paginationQuery = [
  query('pagina')
    .optional()
    .isInt({ min: 1 }).withMessage('Número de página inválido'),
  
  query('limite')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limite de itens por página inválido (entre 1 e 100)')
];