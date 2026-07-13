import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';
import { jsPDF } from 'npm:jspdf@2.5.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 15;
    const maxW = pageW - margin * 2;
    let y = 20;

    const checkPageBreak = (needed = 10) => {
      if (y + needed > pageH - 20) {
        doc.addPage();
        y = 20;
      }
    };

    const addTitle = (text, size = 14) => {
      checkPageBreak(size + 8);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(size);
      doc.setTextColor(185, 28, 45);
      doc.text(text, margin, y);
      y += size / 2 + 4;
    };

    const addHeading = (text) => {
      checkPageBreak(10);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(30, 30, 30);
      doc.text(text, margin, y);
      y += 7;
    };

    const addParagraph = (text, size = 10) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(size);
      doc.setTextColor(50, 50, 50);
      const lines = doc.splitTextToSize(text, maxW);
      lines.forEach((line) => {
        checkPageBreak(size + 2);
        doc.text(line, margin, y);
        y += size / 2 + 2;
      });
      y += 2;
    };

    const addBullet = (text, size = 10) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(size);
      doc.setTextColor(50, 50, 50);
      const lines = doc.splitTextToSize(text, maxW - 6);
      lines.forEach((line, i) => {
        checkPageBreak(size + 2);
        if (i === 0) doc.text('•', margin + 2, y);
        doc.text(line, margin + 7, y);
        y += size / 2 + 2;
      });
      y += 1;
    };

    // ── Cabeçalho ──
    doc.setFillColor(185, 28, 45);
    doc.rect(0, 0, pageW, 12, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text('CARDIOPB — Relatório Técnico de Armazenamento de Dados', margin, 8);
    y = 20;

    addParagraph(`Documento gerado em: ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`);
    addParagraph(`Destinatário: Equipe de TI / Técnico do Governo Estadual (PB)`);
    addParagraph(`Sistema: CARDIOPB — Programa Coração Paraibano`);
    addParagraph(`Plataforma: Base44 (BaaS — Backend as a Service)`);
    y += 3;

    // ── 1. Introdução ──
    addTitle('1. Visão Geral');
    addParagraph(
      'O sistema CARDIOPB foi desenvolvido sobre a plataforma Base44, que oferece backend gerenciado (BaaS). Este documento técnico descreve como os dados são armazenados, as opções de residência de dados, a conformidade com a LGPD, e os caminhos possíveis para hospedagem em infraestrutura governamental própria.'
    );

    // ── 2. Arquitetura Atual ──
    addTitle('2. Arquitetura Atual de Armazenamento');
    addHeading('2.1 Banco de Dados');
    addParagraph(
      'Os dados são armazenados em um banco de dados NoSQL gerenciado (MongoDB) hospedado na infraestrutura da plataforma Base44. Cada entidade (ex: Paciente, SolicitacaoAcesso, RegistroTrombolise, LogAuditoria) corresponde a uma coleção nesse banco. As operações de leitura, escrita, atualização e exclusão são feitas via SDK da plataforma.'
    );
    addHeading('2.2 Segurança e Controle de Acesso (RLS)');
    addParagraph(
      'O sistema implementa Row-Level Security (RLS) em todas as entidades, restringindo o acesso aos dados com base no perfil do usuário (ex: UNIDADE_SAUDE, CERH, ASSCARDIO, ADMINISTRADOR_MASTER). Apenas administradores autorizados têm acesso irrestrito aos dados.'
    );
    addHeading('2.3 Auditoria');
    addParagraph(
      'Toda ação crítica (criar, atualizar, deletar, gerar relatório, transferir, concluir) é registrada na entidade LogAuditoria, contendo: usuário, data/hora, IP de origem, dados anteriores e novos, e campos alterados.'
    );
    addHeading('2.4 Criptografia');
    addParagraph(
      'Os dados são criptografados em trânsito (TLS/HTTPS) e em repouso, conforme os padrões da infraestrutura de nuvem utilizada pela Base44 (AWS/GCP).'
    );

    // ── 3. Residência de Dados ──
    addTitle('3. Residência de Dados (Data Residency)');
    addParagraph(
      'A plataforma Base44 oferece, nos planos Elite e Enterprise, a possibilidade de escolher a região geográfica onde os dados são armazenados. As regiões atualmente disponíveis são:'
    );
    addBullet('Estados Unidos (EUA) — região padrão');
    addBullet('União Europeia (UE)');
    addBullet('Reino Unido (UK)');
    addParagraph(
      'Importante: Atualmente NÃO há opção de data center governamental brasileiro próprio. A escolha de região aplica-se apenas a aplicativos criados após a configuração.'
    );

    // ── 4. Conformidade LGPD ──
    addTitle('4. Conformidade com a LGPD');
    addParagraph(
      'O sistema já possui mecanismos alinhados à Lei Geral de Proteção de Dados (Lei nº 13.709/2018):'
    );
    addBullet('Controle de acesso baseado em perfis (RLS) — minimização de acesso');
    addBullet('Trilha de auditoria completa (LogAuditoria) com IP, usuário e timestamp');
    addBullet('Assinatura digital e códigos de confirmação para documentos clínicos');
    addBullet('Página pública de verificação de autenticidade de documentos');
    addBullet('Status "EXCLUÍDO" para retenção de registros para fins de auditoria');
    addParagraph(
      'Recomenda-se a formalização de um DPA (Data Processing Agreement — Acordo de Tratamento de Dados) entre o órgão público e a Base44, garantindo responsabilidades claras sobre tratamento e proteção de dados pessoais, inclusive de saúde (dados sensíveis — Art. 11 da LGPD).'
    );

    // ── 5. Opções para Hospedagem Governamental ──
    addTitle('5. Opções para Hospedagem em Infraestrutura Governamental');

    addHeading('Opção A: Permanecer na Base44 com DPA (Recomendada)');
    addParagraph(
      'Mantém-se o app na plataforma Base44, com a assinatura de um Acordo de Tratamento de Dados (DPA). Os dados permanecem em infraestrutura de nuvem certificada, com auditoria e segurança já implementadas. Esta opção exige zero reescrita de código e mantém o sistema operacional imediatamente.'
    );
    addParagraph('Vantagens:');
    addBullet('Zero reescrita de código — sistema permanece funcional');
    addBullet('Segurança, backups e atualizações gerenciados pela plataforma');
    addBullet('Conformidade LGPD já parcialmente implementada');
    addBullet('Disponibilidade imediata para uso em produção');
    addParagraph('Desvantagens:');
    addBullet('Dados não ficam fisicamente em data center governamental');
    addBullet('Dependência de terceiro para infraestrutura');

    addHeading('Opção B: Replicação para Banco Governamental (Híbrida)');
    addParagraph(
      'Mantém-se o app na Base44 como fonte primária, mas cria-se funções de backend (serverless) que replicam os dados periodicamente para um banco de dados no data center do governo (ex: PostgreSQL no datacenter da PBSAÚDE). Isso garante que uma cópia dos dados esteja sob controle governamental.'
    );
    addParagraph('Vantagens:');
    addBullet('Cópia dos dados sob controle do governo');
    addBullet('Baixo esforço de implementação (apenas funções de replicação)');
    addBullet('Sistema principal permanece operacional sem mudanças');
    addParagraph('Desvantagens:');
    addBullet('Dados primários ainda na Base44');
    addBullet('Necessidade de sincronização e tratamento de inconsistências');

    addHeading('Opção C: Migração Completa para Infraestrutura Governamental');
    addParagraph(
      'Exporta-se todo o código (frontend + funções de backend) e reescreve-se a camada de dados e autenticação para rodar inteiramente em servidores próprios do governo. Isso envolve:'
    );
    addBullet('Exportação do código frontend (React/Vite) — pasta src/');
    addBullet('Exportação das funções de backend (Deno) — pasta base44/functions/');
    addBullet('Adaptação das funções de Deno para Node.js/Docker');
    addBullet('REESCRITA COMPLETA da camada de acesso a dados (substituir base44.entities por API REST própria conectada a um banco governamental)');
    addBullet('REESCRITA do sistema de autenticação (integrar com GOV.BR OAuth ou LDAP governamental)');
    addBullet('Provisionamento de servidores, CI/CD, certificados SSL, monitoramento');
    addParagraph('Estimativa de esforço: semanas a meses de desenvolvimento dedicado.');
    addParagraph('Vantagens:');
    addBullet('Controle total sobre dados e infraestrutura');
    addBullet('100% em data center governamental');
    addParagraph('Desvantagens:');
    addBullet('Esforço técnico alto (reescrita de camada de dados + autenticação)');
    addBullet('Custo de manutenção de infraestrutura pelo governo');
    addBullet('Pausa no desenvolvimento de novas funcionalidades durante a migração');

    // ── 6. O que é exportável ──
    addTitle('6. O que Pode e NÃO Pode Ser Exportado');
    addHeading('Exportável (leva junto):');
    addBullet('Todo o código frontend (React/Vite) — pasta src/');
    addBullet('Todas as funções de backend (handlers Deno) — pasta base44/functions/');
    addBullet('Schemas das entidades (JSON) — pasta base44/entities/');
    addHeading('NÃO exportável (precisa reescrever):');
    addBullet('Banco de dados gerenciado (MongoDB) — substituir por banco próprio');
    addBullet('SDK de entidades (base44.entities) — reescrever como API REST');
    addBullet('Sistema de autenticação — integrar com GOV.BR/LDAP');
    addBullet('Runtime Deno e infraestrutura de deploy — migrar para Node/Docker');

    // ── 7. Recomendação Técnica ──
    addTitle('7. Recomendação Técnica');
    addParagraph(
      'Para um órgão público estadual de saúde, recomenda-se inicialmente a Opção A (permanecer na Base44 com DPA assinado), garantindo conformidade com a LGPD sem necessidade de reescrita. Caso a exigência de hospedagem em data center próprio seja inegociável, a Opção B (híbrida com replicação) oferece um meio-termo viável com baixo esforço. A Opção C (migração completa) deve ser considerada apenas como projeto de longo prazo, devido ao alto custo e esforço técnico envolvido.'
    );

    // ── 8. Contato ──
    addTitle('8. Contato para Esclarecimentos');
    addParagraph('Desenvolvedor: Walber A. Frazão Jr.');
    addParagraph('Enfermeiro Cardio-Emergencista e Auditor — COREN 110.238');
    addParagraph('Sistema: CARDIOPB — Programa Coração Paraibano');
    addParagraph('Data de emissão: ' + new Date().toLocaleDateString('pt-BR'));

    // Rodapé em todas as páginas
    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('CARDIOPB — Documento Técnico — Página ' + i + ' de ' + pageCount, margin, pageH - 8);
      doc.text('Walber A. Frazão Jr. — COREN 110.238', pageW - margin - 50, pageH - 8);
    }

    const pdfBytes = doc.output('arraybuffer');
    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="CARDIOPB_Relatorio_Tecnico_Armazenamento_Dados.pdf"',
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});