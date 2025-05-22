// backend/src/middleware/uploadMiddleware.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const env = require('../config/env');

// Configuração base do armazenamento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Verifica se é um upload de documento
    let uploadPath = env.UPLOAD_DIR;
    
    // Cria a pasta de uploads se não existir
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    // Se for um upload de documento para um condomínio específico
    if (req.params.condominioId) {
      uploadPath = `${env.UPLOAD_DIR}/condominios/${req.params.condominioId}`;
      
      // Cria a pasta de condomínios se não existir
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
    }
    
    // Se for um upload para uma manutenção específica
    if (req.params.manutencaoId) {
      uploadPath = `${env.UPLOAD_DIR}/manutencoes/${req.params.manutencaoId}`;
      
      // Cria a pasta de manutenções se não existir
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Cria um nome de arquivo único (timestamp + hash + nome original)
    const timestamp = Date.now();
    const hash = crypto.randomBytes(8).toString('hex');
    const extension = path.extname(file.originalname);
    const safeOriginalName = path.basename(file.originalname, extension)
      .replace(/[^a-zA-Z0-9]/g, '_') // Remove caracteres especiais
      .toLowerCase();
    
    cb(null, `${timestamp}-${hash}-${safeOriginalName}${extension}`);
  }
});

// Filtro de tipos de arquivo
const fileFilter = (req, file, cb) => {
  // Define extensões permitidas com base no tipo de upload
  const allowedMimeTypes = [
    // Documentos comuns
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
    'text/plain',
    
    // Imagens
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    
    // Compactados
    'application/zip',
    'application/x-rar-compressed',
    
    // Outros
    'application/json',
    'text/csv'
  ];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não permitido. Tipos aceitos: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, JPG, PNG, GIF, WEBP, ZIP, RAR, JSON, CSV.'), false);
  }
};

// Configuração do middleware de upload
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  }
});

// Exportação dos middlewares de upload
module.exports = {
  // Upload de um único arquivo
  uploadSingle: (fieldName) => upload.single(fieldName),
  
  // Upload de múltiplos arquivos (máximo 5)
  uploadMultiple: (fieldName) => upload.array(fieldName, 5),
  
  // Upload de diferentes campos com arquivos
  uploadFields: (fields) => upload.fields(fields),
  
  // Middleware para tratar erros do multer
  handleMulterError: (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          error: {
            code: 'FILE_TOO_LARGE',
            message: 'O arquivo enviado excede o limite de 10MB.'
          }
        });
      }
      return res.status(400).json({
        error: {
          code: 'UPLOAD_ERROR',
          message: err.message
        }
      });
    }
    next(err);
  }
};