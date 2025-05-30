// backend/src/config/swaggerConfig.js
const swaggerJSDoc = require('swagger-jsdoc');
const env = require('./env');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Gerenciamento de Condomínios',
      version: '1.0.0',
      description: 'API REST para gerenciamento de condomínios, unidades, pagamentos e mais.',
      contact: {
        name: 'Suporte',
        email: 'contato@gestcond.com.br'
      }
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}/api/v1`,
        description: 'Servidor de Desenvolvimento'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/models/*.js'
  ]
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;