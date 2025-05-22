/ backend/src/utils/validators.js
/**
 * Utilitários para validação de dados comuns
 */

/**
 * Valida CPF
 * @param {string} cpf CPF a ser validado (com ou sem formatação)
 * @returns {boolean} true se o CPF for válido, false caso contrário
 */
exports.isValidCPF = (cpf) => {
  // Remove caracteres não numéricos
  cpf = cpf.replace(/[^\d]/g, '');
  
  // Verifica se tem 11 dígitos
  if (cpf.length !== 11) {
    return false;
  }
  
  // Verifica se todos os dígitos são iguais (CPF inválido, mas passaria na validação)
  if (/^(\d)\1{10}$/.test(cpf)) {
    return false;
  }
  
  // Validação do primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let resto = soma % 11;
  let digitoVerificador1 = resto < 2 ? 0 : 11 - resto;
  
  if (digitoVerificador1 !== parseInt(cpf.charAt(9))) {
    return false;
  }
  
  // Validação do segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }
  resto = soma % 11;
  let digitoVerificador2 = resto < 2 ? 0 : 11 - resto;
  
  return digitoVerificador2 === parseInt(cpf.charAt(10));
};

/**
 * Valida CNPJ
 * @param {string} cnpj CNPJ a ser validado (com ou sem formatação)
 * @returns {boolean} true se o CNPJ for válido, false caso contrário
 */
exports.isValidCNPJ = (cnpj) => {
  // Remove caracteres não numéricos
  cnpj = cnpj.replace(/[^\d]/g, '');
  
  // Verifica se tem 14 dígitos
  if (cnpj.length !== 14) {
    return false;
  }
  
  // Verifica se todos os dígitos são iguais (CNPJ inválido, mas passaria na validação)
  if (/^(\d)\1{13}$/.test(cnpj)) {
    return false;
  }
  
  // Validação do primeiro dígito verificador
  let tamanho = cnpj.length - 2;
  let numeros = cnpj.substring(0, tamanho);
  const digitos = cnpj.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;
  
  for (let i = tamanho; i >= 1; i--) {
    soma += numeros.charAt(tamanho - i) * pos--;
    if (pos < 2) {
      pos = 9;
    }
  }
  
  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(0))) {
    return false;
  }
  
  // Validação do segundo dígito verificador
  tamanho += 1;
  numeros = cnpj.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;
  
  for (let i = tamanho; i >= 1; i--) {
    soma += numeros.charAt(tamanho - i) * pos--;
    if (pos < 2) {
      pos = 9;
    }
  }
  
  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  return resultado === parseInt(digitos.charAt(1));
};

/**
 * Valida telefone brasileiro
 * @param {string} telefone Telefone a ser validado (com ou sem formatação)
 * @returns {boolean} true se o telefone for válido, false caso contrário
 */
exports.isValidTelefone = (telefone) => {
  // Remove caracteres não numéricos
  telefone = telefone.replace(/[^\d]/g, '');
  
  // Verifica se tem entre 10 e 11 dígitos (com DDD, com ou sem 9 inicial)
  if (telefone.length < 10 || telefone.length > 11) {
    return false;
  }
  
  // Se tiver 11 dígitos, o primeiro dígito após o DDD deve ser 9
  if (telefone.length === 11 && telefone.charAt(2) !== '9') {
    return false;
  }
  
  // Valida o DDD (entre 11 e 99, excluindo alguns números não utilizados)
  const ddd = parseInt(telefone.substring(0, 2));
  if (ddd < 11 || ddd > 99 || [20, 23, 25, 26, 29, 30, 36, 39, 40, 50, 52, 56, 57, 58, 59, 60, 70, 72, 76, 78, 80, 90].includes(ddd)) {
    return false;
  }
  
  return true;
};

/**
 * Valida CEP brasileiro
 * @param {string} cep CEP a ser validado (com ou sem formatação)
 * @returns {boolean} true se o CEP for válido, false caso contrário
 */
exports.isValidCEP = (cep) => {
  // Remove caracteres não numéricos
  cep = cep.replace(/[^\d]/g, '');
  
  // Verifica se tem 8 dígitos
  if (cep.length !== 8) {
    return false;
  }
  
  // Verifica se não são todos dígitos iguais
  if (/^(\d)\1{7}$/.test(cep)) {
    return false;
  }
  
  return true;
};

/**
 * Formata CPF
 * @param {string} cpf CPF a ser formatado (somente números)
 * @returns {string} CPF formatado (XXX.XXX.XXX-XX)
 */
exports.formatCPF = (cpf) => {
  cpf = cpf.replace(/[^\d]/g, '');
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

/**
 * Formata CNPJ
 * @param {string} cnpj CNPJ a ser formatado (somente números)
 * @returns {string} CNPJ formatado (XX.XXX.XXX/XXXX-XX)
 */
exports.formatCNPJ = (cnpj) => {
  cnpj = cnpj.replace(/[^\d]/g, '');
  return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
};

/**
 * Formata CEP
 * @param {string} cep CEP a ser formatado (somente números)
 * @returns {string} CEP formatado (XXXXX-XXX)
 */
exports.formatCEP = (cep) => {
  cep = cep.replace(/[^\d]/g, '');
  return cep.replace(/(\d{5})(\d{3})/, '$1-$2');
};

/**
 * Formata Telefone
 * @param {string} telefone Telefone a ser formatado (somente números)
 * @returns {string} Telefone formatado ((XX) XXXX-XXXX ou (XX) XXXXX-XXXX)
 */
exports.formatTelefone = (telefone) => {
  telefone = telefone.replace(/[^\d]/g, '');
  if (telefone.length === 11) {
    return telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  return telefone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
};
