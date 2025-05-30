// backend/src/controllers/relatoriosController.js
const path = require('path');
const {
  Condominio,
  Unidade,
  Pagamento,
  Manutencao,
  FinanceiroAvancado,
  Usuario,
  Fornecedor,
  Contrato,
  Inventario
} = require('../models');
const { Op } = require('sequelize');
const PDFGenerator = require('../utils/pdfGenerator');
const logger = require('../config/logger');

/**
 * Gera relatório financeiro
 * @route GET /api/v1/relatorios/financeiro
 */
exports.relatorioFinanceiro = async (req, res, next) => {
  try {
    const {
      condominio_id,
      data_inicio,
      data_fim,
      tipo // 'receitas', 'despesas', 'completo'
    } = req.query;
    
    // Validação dos parâmetros
    if (!condominio_id) {
      return res.status(400).json({ error: 'O ID do condomínio é obrigatório' });
    }
    
    // Verificar se o condomínio existe
    const condominio = await Condominio.findByPk(condominio_id);
    if (!condominio) {
      return res.status(404).json({ error: 'Condomínio não encontrado' });
    }
    
    // Definir período
    let dataInicio, dataFim;
    
    if (data_inicio) {
      dataInicio = new Date(data_inicio);
    } else {
      dataInicio = new Date();
      dataInicio.setMonth(dataInicio.getMonth() - 1);
    }
    
    if (data_fim) {
      dataFim = new Date(data_fim);
    } else {
      dataFim = new Date();
    }
    
    // Título e subtítulo do relatório
    const titulo = `Relatório Financeiro - ${condominio.nome}`;
    const subtitulo = `Período: ${dataInicio.toLocaleDateString('pt-BR')} a ${dataFim.toLocaleDateString('pt-BR')}`;
    
    // Iniciar o gerador de PDF
    const pdf = new PDFGenerator();
    pdf.addHeader(titulo, subtitulo);
    
    // Filtro de período para consultas
    const filtroData = {
      [Op.between]: [dataInicio, dataFim]
    };
    
    // Dados do relatório com base no tipo
    if (tipo !== 'despesas') {
      // Pagamentos recebidos
      const pagamentosRecebidos = await Pagamento.findAll({
        where: {
          status: 'pago',
          data_pagamento: filtroData
        },
        include: [{
          model: Unidade,
          as: 'unidade',
          where: { condominio_id },
          include: [{
            model: Usuario,
            as: 'proprietario',
            attributes: ['nome']
          }]
        }],
        order: [['data_pagamento', 'ASC']]
      });
      
      // Outras receitas
      const outrasReceitas = await FinanceiroAvancado.findAll({
        where: {
          tipo: 'receita',
          condominio_id,
          data_pagamento: filtroData
        },
        order: [['data_pagamento', 'ASC']]
      });
      
      // Adicionar seção de receitas ao PDF
      pdf.addSection('Receitas');
      
      // Pagamentos
      if (pagamentosRecebidos.length > 0) {
        pdf.addText('Pagamentos Recebidos', { bold: true });
        
        const headersPagamentos = ['Data', 'Unidade', 'Descrição', 'Valor (R$)'];
        const rowsPagamentos = pagamentosRecebidos.map(p => [
          p.data_pagamento.toLocaleDateString('pt-BR'),
          `${p.unidade.numero} ${p.unidade.proprietario ? `(${p.unidade.proprietario.nome})` : ''}`,
          p.descricao,
          p.valor.toFixed(2)
        ]);
        
        pdf.addTable(headersPagamentos, rowsPagamentos);
        
        // Total de pagamentos
        const totalPagamentos = pagamentosRecebidos.reduce((acc, p) => acc + parseFloat(p.valor), 0);
        pdf.addText(`Total de Pagamentos: R$ ${totalPagamentos.toFixed(2)}`, { bold: true });
        pdf.doc.moveDown();
      } else {
        pdf.addText('Não há pagamentos recebidos no período.');
        pdf.doc.moveDown();
      }
      
      // Outras receitas
      if (outrasReceitas.length > 0) {
        pdf.addText('Outras Receitas', { bold: true });
        
        const headersReceitas = ['Data', 'Categoria', 'Descrição', 'Valor (R$)'];
        const rowsReceitas = outrasReceitas.map(r => [
          r.data_pagamento.toLocaleDateString('pt-BR'),
          r.categoria,
          r.descricao,
          r.valor.toFixed(2)
        ]);
        
        pdf.addTable(headersReceitas, rowsReceitas);
        
        // Total de outras receitas
        const totalOutrasReceitas = outrasReceitas.reduce((acc, r) => acc + parseFloat(r.valor), 0);
        pdf.addText(`Total de Outras Receitas: R$ ${totalOutrasReceitas.toFixed(2)}`, { bold: true });
        pdf.doc.moveDown();
      } else {
        pdf.addText('Não há outras receitas no período.');
        pdf.doc.moveDown();
      }
      
      // Total geral de receitas
      const totalReceitas = 
        pagamentosRecebidos.reduce((acc, p) => acc + parseFloat(p.valor), 0) +
        outrasReceitas.reduce((acc, r) => acc + parseFloat(r.valor), 0);
      
      pdf.addText(`Total Geral de Receitas: R$ ${totalReceitas.toFixed(2)}`, {
        bold: true,
        fontSize: 14,
        color: pdf.colors.success
      });
      pdf.doc.moveDown(2);
    }
    
    if (tipo !== 'receitas') {
      // Despesas
      const despesas = await FinanceiroAvancado.findAll({
        where: {
          tipo: 'despesa',
          condominio_id,
          data_pagamento: filtroData
        },
        include: [{
          model: Fornecedor,
          as: 'fornecedor',
          attributes: ['nome'],
          required: false
        }],
        order: [['data_pagamento', 'ASC']]
      });
      
      // Adicionar seção de despesas ao PDF
      pdf.addSection('Despesas');
      
      if (despesas.length > 0) {
        const headersDespesas = ['Data', 'Categoria', 'Descrição', 'Fornecedor', 'Valor (R$)'];
        const rowsDespesas = despesas.map(d => [
          d.data_pagamento.toLocaleDateString('pt-BR'),
          d.categoria,
          d.descricao,
          d.fornecedor ? d.fornecedor.nome : '-',
          d.valor.toFixed(2)
        ]);
        
        pdf.addTable(headersDespesas, rowsDespesas);
        
        // Total de despesas
        const totalDespesas = despesas.reduce((acc, d) => acc + parseFloat(d.valor), 0);
        pdf.addText(`Total de Despesas: R$ ${totalDespesas.toFixed(2)}`, {
          bold: true,
          fontSize: 14,
          color: pdf.colors.danger
        });
        pdf.doc.moveDown();
        
        // Agrupar despesas por categoria para o gráfico
        const despesasPorCategoria = {};
        despesas.forEach(d => {
          if (!despesasPorCategoria[d.categoria]) {
            despesasPorCategoria[d.categoria] = 0;
          }
          despesasPorCategoria[d.categoria] += parseFloat(d.valor);
        });
        
        const dataGrafico = Object.entries(despesasPorCategoria).map(([label, value]) => ({ label, value }));
        
        // Adicionar gráfico de despesas por categoria
        if (dataGrafico.length > 0) {
          pdf.addBarChart('Despesas por Categoria', dataGrafico);
        }
      } else {
        pdf.addText('Não há despesas no período.');
      }
      pdf.doc.moveDown(2);
    }
    
    // Resumo financeiro (para tipo 'completo')
    if (tipo === 'completo' || !tipo) {
      // Calcular totais
      const totalReceitas = 
        (await Pagamento.sum('valor', {
          where: { 
            status: 'pago',
            data_pagamento: filtroData
          },
          include: [{
            model: Unidade,
            as: 'unidade',
            where: { condominio_id }
          }]
        }) || 0) +
        (await FinanceiroAvancado.sum('valor', {
          where: {
            tipo: 'receita',
            condominio_id,
            data_pagamento: filtroData
          }
        }) || 0);
      
      const totalDespesas = await FinanceiroAvancado.sum('valor', {
        where: {
          tipo: 'despesa',
          condominio_id,
          data_pagamento: filtroData
        }
      }) || 0;
      
      const saldo = totalReceitas - totalDespesas;
      
      // Adicionar seção de resumo ao PDF
      pdf.addSection('Resumo Financeiro');
      
      pdf.addText(`Total de Receitas: R$ ${totalReceitas.toFixed(2)}`, {
        bold: true,
        color: pdf.colors.success
      });
      
      pdf.addText(`Total de Despesas: R$ ${totalDespesas.toFixed(2)}`, {
        bold: true,
        color: pdf.colors.danger
      });
      
      pdf.addText(`Saldo do Período: R$ ${saldo.toFixed(2)}`, {
        bold: true,
        fontSize: 14,
        color: saldo >= 0 ? pdf.colors.success : pdf.colors.danger
      });
    }
    
    // Finalizar e enviar o PDF
    const pdfPath = await pdf.finalize();
    
    // Enviar o arquivo
    return res.download(pdfPath, `relatorio_financeiro_${condominio_id}_${Date.now()}.pdf`, (err) => {
      if (err) {
        logger.error(`Erro ao enviar o arquivo PDF: ${err.message}`);
        return next(err);
      }
      
      // O arquivo será removido posteriormente pelo sistema operacional ou por um job de limpeza
    });
  } catch (error) {
    logger.error('Erro ao gerar relatório financeiro:', error);
    next(error);
  }
};

/**
 * Gera relatório de inadimplência
 * @route GET /api/v1/relatorios/inadimplencia
 */
exports.relatorioInadimplencia = async (req, res, next) => {
  try {
    const { condominio_id } = req.query;
    
    // Validação dos parâmetros
    if (!condominio_id) {
      return res.status(400).json({ error: 'O ID do condomínio é obrigatório' });
    }
    
    // Verificar se o condomínio existe
    const condominio = await Condominio.findByPk(condominio_id);
    if (!condominio) {
      return res.status(404).json({ error: 'Condomínio não encontrado' });
    }
    
    // Título e subtítulo do relatório
    const titulo = `Relatório de Inadimplência - ${condominio.nome}`;
    const hoje = new Date();
    const subtitulo = `Gerado em: ${hoje.toLocaleDateString('pt-BR')}`;
    
    // Iniciar o gerador de PDF
    const pdf = new PDFGenerator();
    pdf.addHeader(titulo, subtitulo);
    
    // Buscar pagamentos em atraso
    const pagamentosAtrasados = await Pagamento.findAll({
      where: {
        status: 'atrasado'
      },
      include: [{
        model: Unidade,
        as: 'unidade',
        where: { condominio_id },
        include: [{
          model: Usuario,
          as: 'proprietario',
          attributes: ['id', 'nome', 'email', 'telefone']
        }]
      }],
      order: [['data_vencimento', 'ASC']]
    });
    
    // Adicionar detalhes da inadimplência
    pdf.addSection('Pagamentos em Atraso');
    
    if (pagamentosAtrasados.length > 0) {
      // Agrupamento por unidade/proprietário
      const porUnidade = {};
      
      pagamentosAtrasados.forEach(p => {
        const unidadeId = p.unidade.id;
        
        if (!porUnidade[unidadeId]) {
          porUnidade[unidadeId] = {
            unidade: p.unidade,
            pagamentos: [],
            total: 0
          };
        }
        
        porUnidade[unidadeId].pagamentos.push(p);
        porUnidade[unidadeId].total += parseFloat(p.valor);
      });
      
      // Para cada unidade, adicionar os detalhes
      Object.values(porUnidade).forEach(item => {
        const { unidade, pagamentos, total } = item;
        
        pdf.addText(`Unidade: ${unidade.numero} ${unidade.bloco ? `- Bloco ${unidade.bloco}` : ''}`, {
          bold: true,
          fontSize: 12
        });
        
        if (unidade.proprietario) {
          pdf.addText(`Proprietário: ${unidade.proprietario.nome}`);
          pdf.addText(`Contato: ${unidade.proprietario.email} / ${unidade.proprietario.telefone || 'Não informado'}`);
        } else {
          pdf.addText('Proprietário: Não associado');
        }
        
        // Tabela de pagamentos
        const headers = ['Descrição', 'Vencimento', 'Dias em Atraso', 'Valor (R$)'];
        const rows = pagamentos.map(p => {
          const diasAtraso = Math.floor((hoje - new Date(p.data_vencimento)) / (1000 * 60 * 60 * 24));
          
          return [
            p.descricao,
            new Date(p.data_vencimento).toLocaleDateString('pt-BR'),
            diasAtraso.toString(),
            p.valor.toFixed(2)
          ];
        });
        
        pdf.addTable(headers, rows);
        pdf.addText(`Total em atraso: R$ ${total.toFixed(2)}`, {
          bold: true,
          color: pdf.colors.danger
        });
        
        pdf.doc.moveDown();
      });
      
      // Resumo geral
      const totalInadimplencia = pagamentosAtrasados.reduce((acc, p) => acc + parseFloat(p.valor), 0);
      const unidadesInadimplentes = Object.keys(porUnidade).length;
      const mediaAtraso = Math.floor(pagamentosAtrasados.reduce(
        (acc, p) => acc + (hoje - new Date(p.data_vencimento)) / (1000 * 60 * 60 * 24),
        0
      ) / pagamentosAtrasados.length);
      
      pdf.addSection('Resumo da Inadimplência');
      
      pdf.addText(`Total de unidades inadimplentes: ${unidadesInadimplentes}`, { bold: true });
      pdf.addText(`Total de pagamentos em atraso: ${pagamentosAtrasados.length}`, { bold: true });
      pdf.addText(`Média de dias em atraso: ${mediaAtraso}`, { bold: true });
      pdf.addText(`Valor total em atraso: R$ ${totalInadimplencia.toFixed(2)}`, {
        bold: true,
        fontSize: 14,
        color: pdf.colors.danger
      });
    } else {
      pdf.addText('Não há pagamentos em atraso para este condomínio.', {
        bold: true,
        color: pdf.colors.success
      });
    }
    
    // Finalizar e enviar o PDF
    const pdfPath = await pdf.finalize();
    
    // Enviar o arquivo
    return res.download(pdfPath, `relatorio_inadimplencia_${condominio_id}_${Date.now()}.pdf`, (err) => {
      if (err) {
        logger.error(`Erro ao enviar o arquivo PDF: ${err.message}`);
        return next(err);
      }
    });
  } catch (error) {
    logger.error('Erro ao gerar relatório de inadimplência:', error);
    next(error);
  }
};

/**
 * Gera relatório de manutenções
 * @route GET /api/v1/relatorios/manutencoes
 */
exports.relatorioManutencoes = async (req, res, next) => {
  try {
    const {
      condominio_id,
      status,
      data_inicio,
      data_fim
    } = req.query;
    
    // Validação dos parâmetros
    if (!condominio_id) {
      return res.status(400).json({ error: 'O ID do condomínio é obrigatório' });
    }
    
    // Verificar se o condomínio existe
    const condominio = await Condominio.findByPk(condominio_id);
    if (!condominio) {
      return res.status(404).json({ error: 'Condomínio não encontrado' });
    }
    
    // Definir período
    let dataInicio, dataFim;
    
    if (data_inicio) {
      dataInicio = new Date(data_inicio);
    } else {
      dataInicio = new Date();
      dataInicio.setMonth(dataInicio.getMonth() - 3); // Últimos 3 meses
    }
    
    if (data_fim) {
      dataFim = new Date(data_fim);
    } else {
      dataFim = new Date();
    }
    
    // Título e subtítulo do relatório
    const titulo = `Relatório de Manutenções - ${condominio.nome}`;
    const subtitulo = `Período: ${dataInicio.toLocaleDateString('pt-BR')} a ${dataFim.toLocaleDateString('pt-BR')}`;
    
    // Iniciar o gerador de PDF
    const pdf = new PDFGenerator();
    pdf.addHeader(titulo, subtitulo);
    
    // Preparar consulta
    const where = {
      condominio_id,
      data_solicitacao: {
        [Op.between]: [dataInicio, dataFim]
      }
    };
    
    if (status) {
      where.status = status;
    }
    
    // Buscar manutenções
    const manutencoes = await Manutencao.findAll({
      where,
      include: [
        {
          model: Usuario,
          as: 'solicitante',
          attributes: ['id', 'nome']
        },
        {
          model: Fornecedor,
          as: 'fornecedor',
          attributes: ['id', 'nome']
        }
      ],
      order: [['data_solicitacao', 'DESC']]
    });
    
    // Adicionar detalhes das manutenções
    pdf.addSection('Manutenções');
    
    if (manutencoes.length > 0) {
      // Tabela de manutenções
      const headers = ['Data', 'Título', 'Local', 'Status', 'Prioridade', 'Custo (R$)'];
      const rows = manutencoes.map(m => [
        new Date(m.data_solicitacao).toLocaleDateString('pt-BR'),
        m.titulo,
        m.local,
        m.status,
        m.prioridade,
        m.custo_real ? m.custo_real.toFixed(2) : (m.custo_estimado ? m.custo_estimado.toFixed(2) + ' (est.)' : '-')
      ]);
      
      pdf.addTable(headers, rows);
      
      // Estatísticas
      pdf.addSection('Estatísticas');
      
      // Por status
      const porStatus = {};
      manutencoes.forEach(m => {
        if (!porStatus[m.status]) {
          porStatus[m.status] = 0;
        }
        porStatus[m.status]++;
      });
      
      pdf.addText('Manutenções por Status:', { bold: true });
      const dataStatusGrafico = Object.entries(porStatus).map(([label, value]) => ({ label, value }));
      pdf.addBarChart('', dataStatusGrafico);
      
      // Por prioridade
      const porPrioridade = {};
      manutencoes.forEach(m => {
        if (!porPrioridade[m.prioridade]) {
          porPrioridade[m.prioridade] = 0;
        }
        porPrioridade[m.prioridade]++;
      });
      
      pdf.addText('Manutenções por Prioridade:', { bold: true });
      const dataPrioridadeGrafico = Object.entries(porPrioridade).map(([label, value]) => ({ label, value }));
      pdf.addBarChart('', dataPrioridadeGrafico);
      
      // Custos
      const custosReais = manutencoes
        .filter(m => m.custo_real)
        .reduce((acc, m) => acc + parseFloat(m.custo_real), 0);
      
      const custosEstimados = manutencoes
        .filter(m => !m.custo_real && m.custo_estimado)
        .reduce((acc, m) => acc + parseFloat(m.custo_estimado), 0);
      
      pdf.addText(`Custos totais realizados: R$ ${custosReais.toFixed(2)}`, {
        bold: true,
        color: pdf.colors.danger
      });
      
      pdf.addText(`Custos estimados (manutenções não concluídas): R$ ${custosEstimados.toFixed(2)}`, {
        bold: true,
        color: pdf.colors.warning
      });
    } else {
      pdf.addText('Não há manutenções no período especificado.', {
        bold: true
      });
    }
    
    // Finalizar e enviar o PDF
    const pdfPath = await pdf.finalize();
    
    // Enviar o arquivo
    return res.download(pdfPath, `relatorio_manutencoes_${condominio_id}_${Date.now()}.pdf`, (err) => {
      if (err) {
        logger.error(`Erro ao enviar o arquivo PDF: ${err.message}`);
        return next(err);
      }
    });
  } catch (error) {
    logger.error('Erro ao gerar relatório de manutenções:', error);
    next(error);
  }
};

/**
 * Gera relatório de contratos
 * @route GET /api/v1/relatorios/contratos
 */
exports.relatorioContratos = async (req, res, next) => {
  try {
    const {
      condominio_id,
      status,
      vencendo
    } = req.query;
    
    // Validação dos parâmetros
    if (!condominio_id) {
      return res.status(400).json({ error: 'O ID do condomínio é obrigatório' });
    }
    
    // Verificar se o condomínio existe
    const condominio = await Condominio.findByPk(condominio_id);
    if (!condominio) {
      return res.status(404).json({ error: 'Condomínio não encontrado' });
    }
    
    // Título e subtítulo do relatório
    const titulo = `Relatório de Contratos - ${condominio.nome}`;
    const hoje = new Date();
    const subtitulo = `Gerado em: ${hoje.toLocaleDateString('pt-BR')}`;
    
    // Iniciar o gerador de PDF
    const pdf = new PDFGenerator();
    pdf.addHeader(titulo, subtitulo);
    
    // Preparar consulta
    const where = {
      condominio_id
    };
    
    if (status) {
      where.status = status;
    }
    
    // Adicionar filtro para contratos vencendo em X dias
    if (vencendo) {
      const diasVencimento = parseInt(vencendo, 10);
      const dataLimite = new Date();
      dataLimite.setDate(dataLimite.getDate() + diasVencimento);
      
      where.data_fim = {
        [Op.and]: [
          { [Op.gte]: hoje },
          { [Op.lte]: dataLimite }
        ]
      };
      where.status = 'vigente';
    }
    
    // Buscar contratos
    const contratos = await Contrato.findAll({
      where,
      include: [
        {
          model: Fornecedor,
          as: 'fornecedor'
        }
      ],
      order: [['data_fim', 'ASC']]
    });
    
    // Adicionar detalhes dos contratos
    pdf.addSection('Contratos');
    
    if (contratos.length > 0) {
      // Tabela de contratos
      const headers = ['Número', 'Objeto', 'Fornecedor', 'Início', 'Término', 'Valor (R$)', 'Status'];
      const rows = contratos.map(c => [
        c.numero,
        c.objeto,
        c.fornecedor ? c.fornecedor.nome : '-',
        new Date(c.data_inicio).toLocaleDateString('pt-BR'),
        c.data_fim ? new Date(c.data_fim).toLocaleDateString('pt-BR') : 'Indeterminado',
        c.valor.toFixed(2),
        c.status
      ]);
      
      pdf.addTable(headers, rows);
      
      // Detalhes por contrato
      pdf.addSection('Detalhes dos Contratos');
      
      contratos.forEach(c => {
        pdf.addText(`Contrato: ${c.numero}`, {
          bold: true,
          fontSize: 12,
          color: pdf.colors.primary
        });
        
        pdf.addText(`Objeto: ${c.objeto}`);
        pdf.addText(`Fornecedor: ${c.fornecedor ? c.fornecedor.nome : 'Não informado'}`);
        
        if (c.fornecedor) {
          pdf.addText(`CNPJ/CPF: ${c.fornecedor.cnpj_cpf}`);
          pdf.addText(`Contato: ${c.fornecedor.contato_nome || ''} ${c.fornecedor.telefone || ''} ${c.fornecedor.email || ''}`);
        }
        
        pdf.addText(`Período: ${new Date(c.data_inicio).toLocaleDateString('pt-BR')} a ${c.data_fim ? new Date(c.data_fim).toLocaleDateString('pt-BR') : 'Indeterminado'}`);
        pdf.addText(`Valor: R$ ${c.valor.toFixed(2)} (${c.periodicidade_pagamento})`);
        pdf.addText(`Renovação Automática: ${c.renovacao_automatica ? 'Sim' : 'Não'}`);
        pdf.addText(`Status: ${c.status}`);
        
        if (c.descricao) {
          pdf.addText('Descrição:');
          pdf.addText(c.descricao);
        }
        
        if (c.observacoes) {
          pdf.addText('Observações:');
          pdf.addText(c.observacoes);
        }
        
        pdf.doc.moveDown();
      });
      
      // Resumo
      pdf.addSection('Resumo');
      
      // Estatísticas por status
      const porStatus = {};
      contratos.forEach(c => {
        if (!porStatus[c.status]) {
          porStatus[c.status] = 0;
        }
        porStatus[c.status]++;
      });
      
      pdf.addText('Contratos por Status:', { bold: true });
      const dataStatusGrafico = Object.entries(porStatus).map(([label, value]) => ({ label, value }));
      pdf.addBarChart('', dataStatusGrafico);
      
      // Valor total dos contratos vigentes
      const valorTotalVigentes = contratos
        .filter(c => c.status === 'vigente')
        .reduce((acc, c) => acc + parseFloat(c.valor), 0);
      
      pdf.addText(`Valor total dos contratos vigentes: R$ ${valorTotalVigentes.toFixed(2)}`, {
        bold: true,
        color: pdf.colors.primary
      });
      
      // Contratos vencendo em até 30 dias
      const hoje30 = new Date();
      hoje30.setDate(hoje30.getDate() + 30);
      
      const vencendoEm30Dias = contratos.filter(c => 
        c.status === 'vigente' &&
        c.data_fim &&
        c.data_fim >= hoje &&
        c.data_fim <= hoje30
      );
      
      if (vencendoEm30Dias.length > 0) {
        pdf.addText(`Contratos vencendo nos próximos 30 dias: ${vencendoEm30Dias.length}`, {
          bold: true,
          color: pdf.colors.warning
        });
        
        const listaVencendo = vencendoEm30Dias.map(c => 
          `${c.numero} - ${c.objeto} (${c.fornecedor ? c.fornecedor.nome : 'Fornecedor não informado'}) - Vence em ${new Date(c.data_fim).toLocaleDateString('pt-BR')}`
        );
        
        pdf.addList(listaVencendo);
      }
    } else {
      pdf.addText('Não há contratos que atendam aos critérios especificados.', {
        bold: true
      });
    }
    
    // Finalizar e enviar o PDF
    const pdfPath = await pdf.finalize();
    
    // Enviar o arquivo
    return res.download(pdfPath, `relatorio_contratos_${condominio_id}_${Date.now()}.pdf`, (err) => {
      if (err) {
        logger.error(`Erro ao enviar o arquivo PDF: ${err.message}`);
        return next(err);
      }
    });
  } catch (error) {
    logger.error('Erro ao gerar relatório de contratos:', error);
    next(error);
  }
};