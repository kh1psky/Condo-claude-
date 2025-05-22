// backend/src/utils/pdfGenerator.js
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const env = require('../config/env');
const logger = require('../config/logger');

class PDFGenerator {
  constructor(options = {}) {
    this.options = {
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      size: 'A4',
      ...options
    };
    
    // Inicializa o documento
    this.doc = new PDFDocument(this.options);
    
    // Cria o diretório de exportação se não existir
    const exportDir = path.join(env.UPLOAD_DIR, 'relatorios');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }
    
    // Gera um nome de arquivo único
    const timestamp = Date.now();
    this.filename = `${exportDir}/${timestamp}-relatorio.pdf`;
    
    // Cria o stream para escrita do arquivo
    this.stream = fs.createWriteStream(this.filename);
    this.doc.pipe(this.stream);
    
    // Configurações iniciais
    this.fontFamily = 'Helvetica';
    this.doc.font(this.fontFamily);
    
    // Cores
    this.colors = {
      primary: '#a32e57', // Vinho
      secondary: '#36454f', // Charcoal
      accent: '#d4af37', // Gold
      light: '#f5f5dc', // Cream
      text: '#333333',
      lightText: '#666666',
      success: '#28a745',
      danger: '#dc3545',
      warning: '#ffc107',
      info: '#17a2b8'
    };
  }
  
  // Adiciona o cabeçalho do relatório
  addHeader(title, subtitle = null) {
    // Logo (opcional - caso tenha um logo, adicionar aqui)
    /*
    this.doc.image('path/to/logo.png', {
      fit: [100, 100],
      align: 'center'
    });
    */
    
    // Título
    this.doc
      .font(`${this.fontFamily}-Bold`)
      .fontSize(18)
      .fillColor(this.colors.primary)
      .text(title, { align: 'center' });
    
    // Subtítulo (se fornecido)
    if (subtitle) {
      this.doc
        .font(this.fontFamily)
        .fontSize(12)
        .fillColor(this.colors.lightText)
        .text(subtitle, { align: 'center' });
    }
    
    // Data do relatório
    const dataRelatorio = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    this.doc
      .fontSize(10)
      .fillColor(this.colors.lightText)
      .text(`Gerado em: ${dataRelatorio}`, { align: 'center' });
    
    // Linha divisória
    this.doc
      .moveTo(50, 150)
      .lineTo(this.doc.page.width - 50, 150)
      .strokeColor(this.colors.primary)
      .stroke();
    
    // Move o cursor para o início do conteúdo
    this.doc.moveDown(2);
    
    return this;
  }
  
  // Adiciona seção com título
  addSection(title) {
    this.doc
      .font(`${this.fontFamily}-Bold`)
      .fontSize(14)
      .fillColor(this.colors.secondary)
      .text(title)
      .moveDown(0.5);
    
    return this;
  }
  
  // Adiciona tabela simples
  addTable(headers, rows, options = {}) {
    const columnCount = headers.length;
    const tableWidth = this.doc.page.width - 100;
    const columnWidth = tableWidth / columnCount;
    
    let x = 50;
    let y = this.doc.y;
    
    // Desenha cabeçalho da tabela
    this.doc
      .fillColor(this.colors.primary)
      .rect(x, y, tableWidth, 20)
      .fill();
    
    // Textos do cabeçalho
    this.doc.fillColor('#FFFFFF');
    headers.forEach((header, i) => {
      this.doc
        .font(`${this.fontFamily}-Bold`)
        .fontSize(10)
        .text(
          header,
          x + i * columnWidth + 5,
          y + 5,
          { width: columnWidth - 10 }
        );
    });
    
    y += 20;
    
    // Desenha linhas da tabela
    rows.forEach((row, rowIndex) => {
      // Cor de fundo alternada
      if (rowIndex % 2 === 0) {
        this.doc
          .fillColor('#F9F9F9')
          .rect(x, y, tableWidth, 20)
          .fill();
      }
      
      // Textos da linha
      this.doc.fillColor(this.colors.text);
      row.forEach((cell, i) => {
        this.doc
          .font(this.fontFamily)
          .fontSize(10)
          .text(
            cell.toString(),
            x + i * columnWidth + 5,
            y + 5,
            { width: columnWidth - 10 }
          );
      });
      
      y += 20;
      
      // Verifica se precisa de uma nova página
      if (y > this.doc.page.height - 100) {
        this.doc.addPage();
        y = 50;
      }
    });
    
    // Move o cursor para depois da tabela
    this.doc.y = y + 10;
    this.doc.moveDown();
    
    return this;
  }
  
  // Adiciona texto simples
  addText(text, options = {}) {
    const defaults = {
      fontSize: 12,
      color: this.colors.text,
      align: 'left',
      bold: false
    };
    
    const settings = { ...defaults, ...options };
    
    this.doc
      .font(settings.bold ? `${this.fontFamily}-Bold` : this.fontFamily)
      .fontSize(settings.fontSize)
      .fillColor(settings.color)
      .text(text, { align: settings.align });
    
    return this;
  }
  
  // Adiciona uma lista
  addList(items, options = {}) {
    const defaults = {
      fontSize: 12,
      color: this.colors.text,
      bullet: '•'
    };
    
    const settings = { ...defaults, ...options };
    
    items.forEach(item => {
      this.doc
        .font(this.fontFamily)
        .fontSize(settings.fontSize)
        .fillColor(settings.color)
        .text(`${settings.bullet} ${item}`);
    });
    
    this.doc.moveDown();
    
    return this;
  }
  
  // Adiciona um gráfico simples (barra horizontal)
  addBarChart(title, data, options = {}) {
    const defaults = {
      barHeight: 20,
      barGap: 10,
      maxValue: Math.max(...data.map(d => d.value)),
      width: 400
    };
    
    const settings = { ...defaults, ...options };
    
    // Título do gráfico
    this.doc
      .font(`${this.fontFamily}-Bold`)
      .fontSize(12)
      .fillColor(this.colors.secondary)
      .text(title);
    
    const startX = 100;
    const startY = this.doc.y + 10;
    
    // Desenha as barras
    data.forEach((item, index) => {
      const y = startY + index * (settings.barHeight + settings.barGap);
      const barWidth = (item.value / settings.maxValue) * settings.width;
      
      // Rótulo
      this.doc
        .font(this.fontFamily)
        .fontSize(10)
        .fillColor(this.colors.text)
        .text(item.label, 50, y + 5);
      
      // Barra
      this.doc
        .fillColor(this.colors.primary)
        .rect(startX, y, barWidth, settings.barHeight)
        .fill();
      
      // Valor
      this.doc
        .font(this.fontFamily)
        .fontSize(10)
        .fillColor(this.colors.primary)
        .text(item.value.toString(), startX + barWidth + 5, y + 5);
    });
    
    // Move o cursor para depois do gráfico
    this.doc.y = startY + data.length * (settings.barHeight + settings.barGap) + 20;
    
    return this;
  }
  
  // Adiciona o rodapé do relatório
  addFooter(text = 'Sistema de Gerenciamento de Condomínios') {
    const pageCount = this.doc.bufferedPageRange().count;
    
    for (let i = 0; i < pageCount; i++) {
      this.doc.switchToPage(i);
      
      // Linha divisória
      this.doc
        .moveTo(50, this.doc.page.height - 40)
        .lineTo(this.doc.page.width - 50, this.doc.page.height - 40)
        .strokeColor(this.colors.primary)
        .stroke();
      
      // Texto do rodapé
      this.doc
        .font(this.fontFamily)
        .fontSize(8)
        .fillColor(this.colors.lightText)
        .text(
          text,
          50,
          this.doc.page.height - 30,
          { align: 'left' }
        );
      
      // Número da página
      this.doc
        .font(this.fontFamily)
        .fontSize(8)
        .fillColor(this.colors.lightText)
        .text(
          `Página ${i + 1} de ${pageCount}`,
          50,
          this.doc.page.height - 30,
          { align: 'right' }
        );
    }
    
    return this;
  }
  
  // Finaliza o documento e retorna o nome do arquivo
  async finalize() {
    return new Promise((resolve, reject) => {
      // Adiciona o rodapé em todas as páginas
      this.addFooter();
      
      // Finaliza o documento
      this.doc.end();
      
      // Retorna o nome do arquivo quando a escrita for concluída
      this.stream.on('finish', () => {
        logger.info(`PDF gerado com sucesso: ${this.filename}`);
        resolve(this.filename);
      });
      
      this.stream.on('error', (err) => {
        logger.error(`Erro ao gerar PDF: ${err.message}`);
        reject(err);
      });
    });
  }
}

module.exports = PDFGenerator;