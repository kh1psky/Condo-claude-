// backend/src/utils/backup.js
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');
const env = require('../config/env');
const logger = require('../config/logger');

// Promisificar exec para usar com async/await
const execPromise = util.promisify(exec);

class BackupService {
  constructor() {
    // Pasta de backups
    this.backupDir = env.BACKUP_DIR;
    
    // Criar pasta se não existir
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
    
    // Período de retenção em dias
    this.retentionDays = env.BACKUP_RETENTION_DAYS;
  }
  
  /**
   * Cria um backup do banco de dados MySQL
   * @returns {Promise<string>} Caminho do arquivo de backup criado
   */
  async createBackup() {
    try {
      // Nome do arquivo com timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `backup-${timestamp}.sql.gz`;
      const filePath = path.join(this.backupDir, filename);
      
      // Comando para fazer o backup e comprimir
      const cmd = `mysqldump --host=${env.DB_HOST} --port=${env.DB_PORT} --user=${env.DB_USER} --password=${env.DB_PASS} ${env.DB_NAME} | gzip > ${filePath}`;
      
      logger.info(`Iniciando backup do banco de dados para ${filePath}`);
      
      await execPromise(cmd);
      
      logger.info(`Backup concluído com sucesso: ${filePath}`);
      
      return filePath;
    } catch (error) {
      logger.error('Erro ao criar backup: ', error);
      throw new Error(`Erro ao criar backup: ${error.message}`);
    }
  }
  
  /**
   * Remove backups antigos com base no período de retenção
   * @returns {Promise<number>} Número de arquivos removidos
   */
  async cleanOldBackups() {
    try {
      logger.info(`Limpando backups com mais de ${this.retentionDays} dias`);
      
      // Data de corte
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.retentionDays);
      
      // Lista todos os arquivos de backup
      const files = fs.readdirSync(this.backupDir);
      
      let removedCount = 0;
      
      // Verifica cada arquivo
      for (const file of files) {
        if (!file.startsWith('backup-') || !file.endsWith('.sql.gz')) {
          continue;
        }
        
        const filePath = path.join(this.backupDir, file);
        const stats = fs.statSync(filePath);
        
        // Remove se for mais antigo que o período de retenção
        if (stats.mtime < cutoffDate) {
          fs.unlinkSync(filePath);
          logger.info(`Backup antigo removido: ${filePath}`);
          removedCount++;
        }
      }
      
      logger.info(`Limpeza de backups concluída. ${removedCount} arquivos removidos.`);
      
      return removedCount;
    } catch (error) {
      logger.error('Erro ao limpar backups antigos: ', error);
      throw new Error(`Erro ao limpar backups antigos: ${error.message}`);
    }
  }
  
  /**
   * Lista todos os backups disponíveis
   * @returns {Promise<Array>} Lista de backups com informações
   */
  async listBackups() {
    try {
      logger.info('Listando backups disponíveis');
      
      // Lista todos os arquivos de backup
      const files = fs.readdirSync(this.backupDir);
      
      const backups = [];
      
      // Coleta informações de cada arquivo
      for (const file of files) {
        if (!file.startsWith('backup-') || !file.endsWith('.sql.gz')) {
          continue;
        }
        
        const filePath = path.join(this.backupDir, file);
        const stats = fs.statSync(filePath);
        
        backups.push({
          filename: file,
          path: filePath,
          size: stats.size,
          created_at: stats.mtime
        });
      }
      
      // Ordena por data de criação (mais recente primeiro)
      backups.sort((a, b) => b.created_at - a.created_at);
      
      logger.info(`Listagem concluída. ${backups.length} backups encontrados.`);
      
      return backups;
    } catch (error) {
      logger.error('Erro ao listar backups: ', error);
      throw new Error(`Erro ao listar backups: ${error.message}`);
    }
  }
}

module.exports = new BackupService();