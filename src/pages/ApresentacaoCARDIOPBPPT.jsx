import React from "react";
import pptxgen from "pptxgenjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Download, Presentation } from "lucide-react";

// Logos institucionais (mesmo cabeçalho do app)
const LOGO_SECRETARIA = "https://media.base44.com/images/public/68fa0edee56f5a67f929da76/0e16b728d_logoSecretariadeEstadodaSade.png";
const LOGO_CARDIOPB = "https://media.base44.com/images/public/68fa0edee56f5a67f929da76/d2078127c_LOGOCARDIOPB.jpg";
const LOGO_COMPLEXO = "https://media.base44.com/images/public/68fa0edee56f5a67f929da76/940dd8bd1_LogoComplexoregulador.jpg";

// Imagens representando os usuários do App
const IMG_MED_UNIDADE = "https://media.base44.com/images/public/68fa0edee56f5a67f929da76/34c0a19f8_generated_image.png";
const IMG_MED_REGULADOR = "https://media.base44.com/images/public/68fa0edee56f5a67f929da76/3184cd2a4_generated_image.png";
const IMG_ENF_REGULADOR = "https://media.base44.com/images/public/68fa0edee56f5a67f929da76/551289ba9_generated_image.png";
const IMG_CARDIOLOGISTA = "https://media.base44.com/images/public/68fa0edee56f5a67f929da76/35a1a08c1_generated_image.png";
const IMG_AMBULANCIA = "https://media.base44.com/images/public/68fa0edee56f5a67f929da76/cde502008_generated_image.png";
const IMG_CENTRAL_SAMU = "https://media.base44.com/images/public/68fa0edee56f5a67f929da76/89ce429b0_generated_image.png";
const IMG_HEMODINAMICA = "https://media.base44.com/images/public/68fa0edee56f5a67f929da76/321795bab_generated_image.png";

const RED = "C11528";
const RED_DARK = "8B0E20";
const DARK = "1F2937";
const GRAY = "6B7280";
const LIGHT_BG = "F9FAFB";

function addHeader(slide, pptx) {
  // Barra branca superior com os 3 logos
  slide.addImage({ path: LOGO_SECRETARIA, x: 0.3, y: 0.15, w: 1.6, h: 0.55 });
  slide.addImage({ path: LOGO_CARDIOPB, x: 5.5, y: 0.12, w: 2.3, h: 0.6 });
  slide.addImage({ path: LOGO_COMPLEXO, x: 11.2, y: 0.15, w: 1.8, h: 0.55 });
  // Linha vermelha separadora
  slide.addShape(pptx.ShapeType.line, { x: 0, y: 0.85, w: 13.33, h: 0, line: { color: RED, width: 2 } });
}

function addFooter(slide, num, total) {
  slide.addText(`${num} / ${total}`, { x: 12.2, y: 7.05, w: 0.9, h: 0.3, fontSize: 8, color: GRAY, align: "right" });
  slide.addText("CARDIOPB — Programa Coração Paraibano", { x: 0.3, y: 7.05, w: 6, h: 0.3, fontSize: 8, color: GRAY });
  slide.addText("Walber A. Frazão Jr. — COREN 110.238", { x: 6.5, y: 7.05, w: 5.5, h: 0.3, fontSize: 8, color: GRAY, align: "right" });
}

function addTitleBar(slide, pptx, title) {
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0.95, w: 13.33, h: 0.7, fill: { color: RED } });
  slide.addText(title, { x: 0.5, y: 0.95, w: 12.3, h: 0.7, fontSize: 20, bold: true, color: "FFFFFF", valign: "middle" });
}

function addBullets(slide, bullets, x, y, w, h, fontSize = 14) {
  const items = bullets.map(b => ({ text: b, options: { bullet: { code: "2022" }, fontSize, color: DARK, breakLine: true, paraSpaceAfter: 6 } }));
  slide.addText(items, { x, y, w, h });
}

function addTextBlock(slide, text, x, y, w, h, fontSize = 13) {
  slide.addText(text, { x, y, w, h, fontSize, color: DARK, valign: "top", lineSpacingMultiple: 1.2 });
}

function addSectionLabel(slide, label, x, y) {
  slide.addText(label, { x, y, w: 8, h: 0.3, fontSize: 11, bold: true, color: RED, fontFace: "Arial" });
}

export default function ApresentacaoCARDIOPBPPT() {
  const gerarPPT = async () => {
    const pptx = new pptxgen();
    pptx.defineLayout({ name: "WIDE", width: 13.33, height: 7.5 });
    pptx.layout = "WIDE";
    pptx.author = "Walber A. Frazão Jr.";
    pptx.title = "CARDIOPB — Apresentação Institucional";
    pptx.subject = "Triagem e Regulação Médica do IAM da Paraíba";

    const TOTAL = 60;

    // ═════════════ SLIDE 1 — CAPA ═════════════
    let s = pptx.addSlide();
    s.background = { color: RED };
    s.addImage({ path: LOGO_CARDIOPB, x: 4.6, y: 0.8, w: 4.1, h: 1.1 });
    s.addText("CARDIOPB", { x: 0.5, y: 2.2, w: 12.3, h: 0.9, fontSize: 44, bold: true, color: "FFFFFF", align: "center" });
    s.addText("Programa Coração Paraibano", { x: 0.5, y: 3.1, w: 12.3, h: 0.5, fontSize: 20, color: "FFFFFF", align: "center" });
    s.addText("Triagem e Regulação Médica do IAM da Paraíba", { x: 0.5, y: 3.7, w: 12.3, h: 0.4, fontSize: 16, color: "FECACA", align: "center" });
    s.addShape(pptx.ShapeType.rect, { x: 4.6, y: 4.4, w: 4.1, h: 0.03, fill: { color: "FFFFFF" } });
    s.addText("Apresentação Institucional para Autoridade Sanitária", { x: 0.5, y: 4.8, w: 12.3, h: 0.4, fontSize: 14, color: "FFFFFF", align: "center" });
    s.addText("Secretaria de Estado da Saúde da Paraíba (SES-PB)", { x: 0.5, y: 5.3, w: 12.3, h: 0.35, fontSize: 12, color: "FECACA", align: "center" });
    s.addText("João Pessoa, agosto de 2026", { x: 0.5, y: 5.7, w: 12.3, h: 0.35, fontSize: 12, color: "FECACA", align: "center" });
    s.addImage({ path: LOGO_SECRETARIA, x: 2, y: 6.3, w: 1.8, h: 0.6 });
    s.addImage({ path: LOGO_COMPLEXO, x: 9.5, y: 6.3, w: 1.8, h: 0.6 });

    // ═════════════ SLIDE 2 — AGENDA ═════════════
    s = pptx.addSlide();
    addHeader(s, pptx);
    addTitleBar(s, pptx, "Agenda da Apresentação");
    const agendaItems = [
      "1. O que é o CARDIOPB",
      "2. Objetivos Principais",
      "3. A Linha do Tempo Crítica (Tempo-Coração)",
      "4. Como Acessar o Sistema (GOV.BR)",
      "5. Perfis de Usuários da Plataforma",
      "6. Fluxo Completo do Paciente",
      "7. Protocolo de Dor Torácica e Estratégias",
      "8. Trombólise e Indicadores de Qualidade",
      "9. Arquitetura Tecnológica",
      "10. Segurança, LGPD e Residência de Dados",
      "11. Opções de Hospedagem e Exportabilidade",
      "12. Recomendação Técnica e Encerramento"
    ];
    s.addText(agendaItems.map(i => ({ text: i, options: { fontSize: 15, color: DARK, breakLine: true, paraSpaceAfter: 8, bullet: false } })), { x: 0.8, y: 1.9, w: 11.5, h: 4.8 });
    addFooter(s, 2, TOTAL);

    // ═════════════ SLIDE 3 — O QUE É O CARDIOPB ═════════════
    s = pptx.addSlide();
    addHeader(s, pptx);
    addTitleBar(s, pptx, "1. O que é o CARDIOPB?");
    addTextBlock(s, "O CARDIOPB é uma plataforma digital estratégica voltada para a gestão e regulação médica de pacientes com Infarto Agudo do Miocárdio (IAM) no estado da Paraíba.", 0.6, 1.9, 7, 1.2, 15);
    addTextBlock(s, "O aplicativo atua como ferramenta centralizada de comunicação, triagem e tomada de decisão para profissionais de saúde, otimizando o fluxo de atendimento desde a Unidade de Saúde de origem até os centros de hemodinâmica.", 0.6, 3.1, 7, 1.5, 13);
    addTextBlock(s, "Desenvolvido sobre a plataforma Base44 (BaaS), oferece backend gerenciado, segurança e disponibilidade imediata.", 0.6, 4.6, 7, 1, 13);
    s.addShape(pptx.ShapeType.roundRect, { x: 8, y: 2.0, w: 4.8, h: 3.5, fill: { color: LIGHT_BG }, line: { color: RED, width: 1 } });
    s.addText("Plataforma Digital\nEstratégica", { x: 8.2, y: 2.3, w: 4.4, h: 1, fontSize: 18, bold: true, color: RED, align: "center", valign: "middle" });
    s.addText("• Triagem cardiológica\n• Regulação médica\n• Transporte sanitário\n• Hemodinâmica\n• Indicadores em tempo real", { x: 8.3, y: 3.4, w: 4.2, h: 2, fontSize: 13, color: DARK, valign: "top", lineSpacingMultiple: 1.4 });
    addFooter(s, 3, TOTAL);

    // ═════════════ SLIDE 4 — OBJETIVOS ═════════════
    s = pptx.addSlide();
    addHeader(s, pptx);
    addTitleBar(s, pptx, "2. Objetivos Principais");
    addBullets(s, [
      "Redução do Tempo de Atendimento: agilizar diagnóstico e conduta terapêutica (trombólise) para salvar vidas.",
      "Regulação Eficiente: centralizar a fila de regulação, permitindo ao complexo regulador coordenar vagas e transporte em tempo real.",
      "Padronização de Condutas: disseminar protocolos clínicos atualizados para toda a rede de saúde do estado.",
      "Monitoramento e Auditoria: fornecer dados precisos sobre a performance da rede (indicadores de qualidade) para a gestão pública.",
      "Transparência: transformar cada minuto de atendimento em dado mensurável e auditável."
    ], 0.8, 2.0, 11.5, 4.5, 15);
    addFooter(s, 4, TOTAL);

    // ═════════════ SLIDE 5 — O PROBLEMA / LINHA DO TEMPO ═════════════
    s = pptx.addSlide();
    addHeader(s, pptx);
    addTitleBar(s, pptx, "3. A Linha do Tempo Crítica — Tempo-Coração");
    addTextBlock(s, "O IAM é uma emergência tempo-dependente: cada minuto de atraso na reperfusão significa mais tecido cardíaco perdido.", 0.6, 1.9, 12, 0.8, 15);
    addSectionLabel(s, "Janelas terapêuticas", 0.6, 2.7);
    const timeline = [
      { t: "0h", desc: "Início dos sintomas" },
      { t: "Door", desc: "Chegada na unidade de saúde" },
      { t: "ECG", desc: "≤ 10 min — ECG e classificação" },
      { t: "Triagem", desc: "Avaliação médica cardiológica" },
      { t: "Trombólise", desc: "Porta-agulha ≤ 30 min" },
      { t: "Transporte", desc: "Regulação e deslocamento" },
      { t: "Hemodinâmica", desc: "Porta-balão ≤ 90 min" }
    ];
    const stepW = 1.7;
    timeline.forEach((item, i) => {
      const x = 0.5 + i * (stepW + 0.1);
      s.addShape(pptx.ShapeType.roundRect, { x, y: 3.3, w: stepW, h: 1.6, fill: { color: i < 4 ? RED : RED_DARK } });
      s.addText(item.t, { x, y: 3.4, w: stepW, h: 0.5, fontSize: 16, bold: true, color: "FFFFFF", align: "center" });
      s.addText(item.desc, { x: x + 0.1, y: 3.9, w: stepW - 0.2, h: 0.9, fontSize: 10, color: "FFFFFF", align: "center", valign: "top", lineSpacingMultiple: 1.1 });
      if (i < timeline.length - 1) {
        s.addShape(pptx.ShapeType.rightArrow, { x: x + stepW, y: 3.9, w: 0.1, h: 0.4, fill: { color: GRAY } });
      }
    });
    addTextBlock(s, "O CARDIOPB transforma cada etapa em dado mensurável, gerando inteligência epidemiológica em tempo real para a SES-PB.", 0.6, 5.3, 12, 1, 13);
    addFooter(s, 5, TOTAL);

    // ═════════════ SLIDE 6 — COMO ACESSAR (GOV.BR) ═════════════
    s = pptx.addSlide();
    addHeader(s, pptx);
    addTitleBar(s, pptx, "4. Como Acessar o Sistema — Autenticação GOV.BR");
    addTextBlock(s, "O acesso é feito via autenticação federal GOV.BR, garantindo identidade validada e rastreável de cada profissional.", 0.6, 1.9, 12, 0.8, 14);
    const acessos = [
      { n: "1", t: "Tela de Boas-Vindas", d: "Botão GOV.BR para autenticar com CPF + senha federal." },
      { n: "2", t: "Seleção de Usuário", d: "Escolha entre Usuário Novo (primeiro acesso) ou Usuário Cadastrado (acesso aprovado)." },
      { n: "3", t: "Usuário Novo — Cadastro", d: "Preenche perfil, nome, CPF, profissão e registro (CRM/COREN/CRESS). Dados vão para análise do Administrador." },
      { n: "4", t: "Usuário Cadastrado — Acesso", d: "Após aprovação, é direcionado automaticamente ao painel correspondente ao seu perfil." }
    ];
    acessos.forEach((a, i) => {
      const y = 2.9 + i * 1.0;
      s.addShape(pptx.ShapeType.ellipse, { x: 0.6, y, w: 0.5, h: 0.5, fill: { color: RED } });
      s.addText(a.n, { x: 0.6, y, w: 0.5, h: 0.5, fontSize: 16, bold: true, color: "FFFFFF", align: "center", valign: "middle" });
      s.addText(a.t, { x: 1.3, y, w: 3, h: 0.5, fontSize: 14, bold: true, color: DARK, valign: "middle" });
      s.addText(a.d, { x: 4.4, y, w: 8.3, h: 0.5, fontSize: 12, color: GRAY, valign: "middle" });
    });
    addFooter(s, 6, TOTAL);

    // ═════════════ SLIDE 7 — STATUS DE ACESSO ═════════════
    s = pptx.addSlide();
    addHeader(s, pptx);
    addTitleBar(s, pptx, "Status de Acesso e Controle de Usuários");
    const statusItems = [
      { label: "PENDENTE", desc: "Cadastro realizado, aguardando aprovação do Administrador", color: "F59E0B" },
      { label: "ATIVO", desc: "Acesso liberado e funcionando normalmente", color: "16A34A" },
      { label: "INATIVO", desc: "Acesso suspenso temporariamente", color: "6B7280" },
      { label: "BLOQUEADO", desc: "Acesso bloqueado por motivo administrativo", color: "DC2626" },
      { label: "EXCLUÍDO", desc: "Registro retido para fins de auditoria (LGPD)", color: "991B1B" }
    ];
    statusItems.forEach((st, i) => {
      const y = 2.0 + i * 0.85;
      s.addShape(pptx.ShapeType.roundRect, { x: 0.8, y, w: 3, h: 0.6, fill: { color: st.color } });
      s.addText(st.label, { x: 0.8, y, w: 3, h: 0.6, fontSize: 14, bold: true, color: "FFFFFF", align: "center", valign: "middle" });
      s.addText(st.desc, { x: 4.2, y, w: 8, h: 0.6, fontSize: 13, color: DARK, valign: "middle" });
    });
    addTextBlock(s, "Gestão centralizada via painel de Controle de Acessos pelo Administrador Master e TI da Secretaria.", 0.8, 6.3, 11.5, 0.5, 12);
    addFooter(s, 7, TOTAL);

    // ═════════════ SLIDE 8 — PERFIS DE USUÁRIO (OVERVIEW) ═════════════
    s = pptx.addSlide();
    addHeader(s, pptx);
    addTitleBar(s, pptx, "5. Perfis de Usuários da Plataforma");
    addTextBlock(s, "O CARDIOPB atende toda a rede de atendimento cardiovascular do estado, com perfis específicos para cada etapa do fluxo:", 0.6, 1.9, 12, 0.7, 14);
    const perfis = [
      { t: "Médicos das Unidades de Saúde", d: "Triagem e avaliação clínica inicial" },
      { t: "Médico Regulador", d: "Regulação central e destino do paciente" },
      { t: "Enfermeiro Regulador", d: "Apoio à regulação e classificação" },
      { t: "Cardiologista (ASSCARDIO)", d: "Assessoria cardiológica especializada" },
      { t: "Equipe de Ambulância", d: "Transporte sanitário seguro" },
      { t: "Centrais SAMU / COFIH", d: "Coordenação de transporte e vagas" },
      { t: "Equipes de Hemodinâmica", d: "Intervenção coronariana percutânea" }
    ];
    perfis.forEach((p, i) => {
      const col = i < 4 ? 0 : 1;
      const row = i % 4;
      const x = 0.6 + col * 6.3;
      const y = 2.7 + row * 0.9;
      s.addShape(pptx.ShapeType.roundRect, { x, y, w: 5.8, h: 0.75, fill: { color: LIGHT_BG }, line: { color: RED, width: 0.5 } });
      s.addShape(pptx.ShapeType.rect, { x, y, w: 0.08, h: 0.75, fill: { color: RED } });
      s.addText(p.t, { x: x + 0.2, y, w: 5.5, h: 0.4, fontSize: 13, bold: true, color: DARK, valign: "bottom" });
      s.addText(p.d, { x: x + 0.2, y: y + 0.38, w: 5.5, h: 0.35, fontSize: 10, color: GRAY, valign: "top" });
    });
    addFooter(s, 8, TOTAL);

    // ═════════════ SLIDES 9-15 — USUÁRIOS COM IMAGEM ═════════════
    const usuarios = [
      { img: IMG_MED_UNIDADE, title: "Médicos das Unidades de Saúde", desc: "Responsáveis pela triagem inicial, ECG (≤10 min), avaliação cardiológica e classificação da Síndrome Coronariana Aguda. Preenchem dados vitais, solicitam exames e iniciam o protocolo de dor torácica. Atuam na linha de frente do atendimento ao paciente com IAM." },
      { img: IMG_MED_REGULADOR, title: "Médico Regulador (CERH)", desc: "Atua na Central de Regulação, analisando casos enviados pelas unidades, definindo destino do paciente, liberando vagas em hemodinâmica e coordenando o fluxo da fila de regulação em tempo real. Toma a decisão final de encaminhamento." },
      { img: IMG_ENF_REGULADOR, title: "Enfermeiro Regulador", desc: "Dá suporte à regulação médica, realiza classificação de risco, valida dados clínicos enviados pelas unidades e auxilia na comunicação entre unidades de saúde, centrais de transporte e hemodinâmica." },
      { img: IMG_CARDIOLOGISTA, title: "Cardiologista — ASSCARDIO", desc: "Equipe de assessoria cardiológica que emite pareceres especializados, analisa ECG complexos, calcula HEART Score, recomenda estratégias (trombólise, ICP, conservador) e retifica condutas quando necessário. Conexão remota com as unidades." },
      { img: IMG_AMBULANCIA, title: "Equipe de Ambulância (Transporte)", desc: "Executa o transporte sanitário do paciente entre a unidade de origem e o centro de hemodinâmica. Registra intercorrências, monitora sinais vitais durante o deslocamento e atualiza o status de transporte no aplicativo em tempo real." },
      { img: IMG_CENTRAL_SAMU, title: "Centrais SAMU e COFIH", desc: "Centrais de regulação de ambulâncias (SAMU) e COFIH coordenam a disponibilidade de vagas e veículos. Operam o Monitor de Transportes, garantindo que o recurso certo chegue ao paciente certo no menor tempo possível." },
      { img: IMG_HEMODINAMICA, title: "Equipes de Hemodinâmica", desc: "Realizam a Intervenção Coronariana Percutânea (ICP) primária ou de resgate. Registram tempo porta-balão, agendamento, comparecimento do paciente, procedimento realizado, reperfusão efetiva e desfecho clínico." }
    ];

    usuarios.forEach((u, i) => {
      s = pptx.addSlide();
      addHeader(s, pptx);
      addTitleBar(s, pptx, `5.${i + 1} ${u.title}`);
      s.addShape(pptx.ShapeType.roundRect, { x: 0.6, y: 1.9, w: 5.5, h: 4.6, fill: { color: LIGHT_BG }, line: { color: RED, width: 0.5 } });
      s.addImage({ path: u.img, x: 0.8, y: 2.1, w: 5.1, h: 4.2 });
      s.addText(u.desc, { x: 6.5, y: 2.1, w: 6.3, h: 4.4, fontSize: 14, color: DARK, valign: "top", lineSpacingMultiple: 1.3 });
      addFooter(s, 9 + i, TOTAL);
    });

    // ═════════════ SLIDE 16 — FLUXO DO PACIENTE (OVERVIEW) ═════════════
    s = pptx.addSlide();
    addHeader(s, pptx);
    addTitleBar(s, pptx, "6. Fluxo Completo do Paciente");
    const etapas = [
      { n: 1, t: "Triagem", d: "Dados do paciente, sinais e classificação de risco" },
      { n: 2, t: "Triagem Médica", d: "Avaliação cardiológica, ECG e sinais vitais" },
      { n: 3, t: "Classificação SCA", d: "SCACEST, SCASEST com/sem troponina" },
      { n: 4, t: "Assessoria", d: "Parecer do cardiologista (ASSCARDIO)" },
      { n: 5, t: "Regulação", d: "Destino e vaga definidos pela CERH" },
      { n: 6, t: "Transporte", d: "Deslocamento com equipe de ambulância" },
      { n: 7, t: "Hemodinâmica", d: "ICP e registro do desfecho clínico" }
    ];
    etapas.forEach((e, i) => {
      const col = i % 4;
      const row = Math.floor(i / 4);
      const x = 0.5 + col * 3.15;
      const y = 2.0 + row * 2.4;
      s.addShape(pptx.ShapeType.roundRect, { x, y, w: 2.9, h: 2.1, fill: { color: LIGHT_BG }, line: { color: RED, width: 1 } });
      s.addShape(pptx.ShapeType.ellipse, { x: x + 1.05, y: y + 0.15, w: 0.8, h: 0.8, fill: { color: RED } });
      s.addText(String(e.n), { x: x + 1.05, y: y + 0.15, w: 0.8, h: 0.8, fontSize: 24, bold: true, color: "FFFFFF", align: "center", valign: "middle" });
      s.addText(e.t, { x: x + 0.1, y: y + 1.05, w: 2.7, h: 0.4, fontSize: 13, bold: true, color: DARK, align: "center" });
      s.addText(e.d, { x: x + 0.1, y: y + 1.45, w: 2.7, h: 0.6, fontSize: 9, color: GRAY, align: "center", valign: "top", lineSpacingMultiple: 1.1 });
    });
    addFooter(s, 16, TOTAL);

    // ═════════════ SLIDES 17-23 — ETAPAS DETALHADAS ═════════════
    const etapasDetalhe = [
      { t: "6.1 Etapa 1 — Triagem de Enfermagem", items: ["Data/hora de início da triagem e dos sintomas", "Macrorregião, cidade e unidade de saúde", "Dados do paciente (nome, idade, sexo)", "Uso de inibidor de fosfodiesterase", "Classificação de risco (vermelha, laranja, amarela, verde)", "Indicador Triagem-ECG (meta ≤ 10 minutos)", "Tempo de dor calculado automaticamente"] },
      { t: "6.2 Etapa 2 — Triagem Médica Cardiológica", items: ["Sinais vitais (PA, FC, FR, Temp, SpO2, glicemia)", "Eletrocardiograma (ECG) digitalizado anexado", "Classificação da Síndrome Coronariana Aguda", "Alterações eletrocardiográficas detalhadas", "Tipo de SCA: SCACEST, SCASEST com ou sem troponina", "Identificação de supra de ST por parede", "Janela terapêutica automática"] },
      { t: "6.3 Etapa 3 — Avaliação Clínica e HEART Score", items: ["Antecedentes e quadro atual", "Hipótese diagnóstica", "Cálculo do HEART Score (0-10 pontos)", "Interpretação automática (baixo/médio/alto risco)", "Fatores de risco cardiovasculares", "Troponina: limite superior e valor do paciente", "Prescrição de medicamentos e exames solicitados", "Informações para transporte (suporte ventilatório)"] },
      { t: "6.4 Etapa 4 — Assessoria Cardiológica (ASSCARDIO)", items: ["Parecer do cardiologista (diagnóstico e conduta)", "Diagnóstico e estratégia definida", "Indicação de hemodinâmica (sim/não)", "Classificação de urgência (Emergência/Urgente/Eletivo)", "Cálculo do HEART Score pela assessoria", "Análise de ECG supra e sem supra", "Confirmação da triagem da unidade", "Pré-parecer e rascunho salvos automaticamente"] },
      { t: "6.5 Etapa 5 — Regulação Central (CERH)", items: ["Médico regulador define unidade de destino", "Liberação de vagas em hemodinâmica", "Conduta inicial e conduta final registradas", "Senha SES para o transporte", "Parecer do enfermeiro regulador", "Observações de regulação", "Solicitação de reavaliação de conduta pela unidade", "Histórico de pareceres retificados"] },
      { t: "6.6 Etapa 6 — Transporte Sanitário", items: ["Solicitação de transporte com data/hora", "Equipe responsável e tipo de transporte", "Central de transporte (SAMU/COFIH)", "Status: Aguardando, Em Deslocamento, Concluído", "Registro de intercorrências e ações tomadas", "Relatório de transporte em PDF com assinatura digital", "Monitor de Transportes em tempo real", "Histórico de intercorrências documentado"] },
      { t: "6.7 Etapa 7 — Hemodinâmica", items: ["Tipo de ICP (imediata, até 24h, até 72h, trombólise-ICP)", "Data/hora de chegada e início do procedimento", "Tempo FMC-to-Device (First Medical Contact)", "Procedimento realizado e ICP realizada", "Reperfusão efetiva (sim/não)", "Intercorrências durante o procedimento", "Desfecho: Sucesso, Complicações ou Óbito", "Tempo Porta-Balão calculado automaticamente"] }
    ];
    etapasDetalhe.forEach((e, i) => {
      s = pptx.addSlide();
      addHeader(s, pptx);
      addTitleBar(s, pptx, e.t);
      addBullets(s, e.items, 0.8, 2.0, 11.5, 4.5, 13);
      addFooter(s, 17 + i, TOTAL);
    });

    // ═════════════ SLIDE 24 — PROTOCOLO DOR TORÁCICA ═════════════
    s = pptx.addSlide();
    addHeader(s, pptx);
    addTitleBar(s, pptx, "7. Protocolo de Dor Torácica — CARDIOPB 2026");
    addTextBlock(s, "Documento institucional da Secretaria de Estado da Saúde para orientação de médicos e equipe multiprofissional na abordagem de pacientes com Síndrome Coronariana Aguda (SCA).", 0.6, 1.9, 12, 0.9, 14);
    addSectionLabel(s, "Indicação", 0.6, 2.9);
    addTextBlock(s, "Pacientes com dor torácica aguda de origem não traumática, ou sintoma equivalente, com início nas últimas 24 horas, incluindo PCR na admissão e diagnósticos diferenciais.", 0.6, 3.2, 12, 1, 13);
    addSectionLabel(s, "Objetivos", 0.6, 4.2);
    addBullets(s, [
      "Identificação precoce de pacientes com SCA",
      "ECG em até 10 minutos analisado pelo médico plantonista",
      "Triagem de qualidade com classificação de risco",
      "Conduta terapêutica dentro da janela terapêutica ideal"
    ], 0.6, 4.5, 12, 2.2, 13);
    addFooter(s, 24, TOTAL);

    // ═════════════ SLIDES 25-27 — CENÁRIOS ═════════════
    const cenarios = [
      { t: "7.1 Cenário 1 — Hospital Sem Hemodinâmica", desc: "Estratégia 1: Paciente com SCACEST em hospital sem hemodinâmica disponível. Indicação de trombólise farmacológica (tenecteplase) dentro da janela terapêutica, seguida de transporte regulado para centro de hemodinâmica de referência para ICP de resgate se necessário.", items: ["Triagem e ECG ≤ 10 minutos", "Confirmação de SCACEST", "Trombólise dentro de 30 minutos (porta-agulha)", "Transporte regulado para hemodinâmica", "ICP de resgate se falha de reperfusão"] },
      { t: "7.2 Cenário 2 — Hospital Com Hemodinâmica", desc: "Estratégia 1 em hospital com hemodinâmica: paciente com SCACEST encaminhado diretamente para ICP primária, sem trombólise prévia. Otimização do tempo porta-balão ≤ 90 minutos.", items: ["Triagem e ECG ≤ 10 minutos", "Confirmação de SCACEST", "Encaminhamento direto à hemodinâmica", "ICP primária (porta-balão ≤ 90 min)", "Sem necessidade de trombólise farmacológica"] },
      { t: "7.3 Cenário 3 — Estratégias 2 e 3", desc: "Estratégias 2 e 3 aplicadas a SCASEST: conduta conservadora com monitorização, troponinas seriadas e decisão baseada em HEART Score e evolução clínica.", items: ["Triagem e ECG ≤ 10 minutos", "SCASEST com ou sem troponina", "HEART Score para estratificação de risco", "Conduta conservadora ou invasiva conforme score", "Reavaliação clínica contínua"] }
    ];
    cenarios.forEach((c, i) => {
      s = pptx.addSlide();
      addHeader(s, pptx);
      addTitleBar(s, pptx, c.t);
      addTextBlock(s, c.desc, 0.6, 1.9, 12, 1.3, 14);
      addBullets(s, c.items, 0.8, 3.4, 11.5, 3, 14);
      addFooter(s, 25 + i, TOTAL);
    });

    // ═════════════ SLIDE 28 — TROMBÓLISE ═════════════
    s = pptx.addSlide();
    addHeader(s, pptx);
    addTitleBar(s, pptx, "8. Gestão de Trombólise");
    addTextBlock(s, "O módulo de Trombólise registra a prescrição e administração de trombolíticos (tenecteplase, alteplase), com controle de lote, dose, diluição e profissionais envolvidos.", 0.6, 1.9, 12, 1, 14);
    addBullets(s, [
      "Indicação clínica: IAM, TEP ou AVC",
      "Medicamento: Tenecteplase 40mg/50mg ou Alteplase 100mg",
      "Controle de lote e validade do medicamento",
      "Prescrição médica com CRM do prescritor",
      "Administração registrada com COREN do enfermeiro",
      "Registro de intercorrências pós-trombólise",
      "Relatório em PDF com assinatura digital e código de confirmação",
      "Integração com o relatório farmacêutico para gestão de estoque"
    ], 0.8, 3.1, 11.5, 3.5, 14);
    addFooter(s, 28, TOTAL);

    // ═════════════ SLIDE 29 — INDICADORES ═════════════
    s = pptx.addSlide();
    addHeader(s, pptx);
    addTitleBar(s, pptx, "8.1 Indicadores de Qualidade");
    addTextBlock(s, "O CARDIOPB gera indicadores epidemiológicos e operacionais em tempo real, exportáveis em PDF e Excel para a gestão pública.", 0.6, 1.9, 12, 0.8, 14);
    const inds = [
      { v: "≤ 10 min", l: "Triagem → ECG" },
      { v: "≤ 30 min", l: "Porta → Agulha (trombólise)" },
      { v: "≤ 90 min", l: "Porta → Balão (ICP)" },
      { v: "Tempo real", l: "Monitor de Transportes" }
    ];
    inds.forEach((ind, i) => {
      const x = 0.5 + i * 3.1;
      s.addShape(pptx.ShapeType.roundRect, { x, y: 3.0, w: 2.9, h: 1.8, fill: { color: RED } });
      s.addText(ind.v, { x, y: 3.2, w: 2.9, h: 0.9, fontSize: 28, bold: true, color: "FFFFFF", align: "center", valign: "middle" });
      s.addText(ind.l, { x, y: 4.15, w: 2.9, h: 0.5, fontSize: 12, color: "FECACA", align: "center", valign: "middle" });
    });
    addBullets(s, [
      "Distribuição de classificações de risco (vermelha, laranja, amarela, verde)",
      "Tempo médio por etapa do fluxo (triagem, regulacao, transporte, hemodinâmica)",
      "Percentual de pacientes dentro da janela terapêutica",
      "Taxa de ICP realizadas e taxa de reperfusão efetiva",
      "Envio automático de indicadores ao IAMPBSAUDE"
    ], 0.8, 5.1, 11.5, 1.5, 12);
    addFooter(s, 29, TOTAL);

    // ═════════════ SLIDE 30 — MONITOR DE TRANSPORTES ═════════════
    s = pptx.addSlide();
    addHeader(s, pptx);
    addTitleBar(s, pptx, "8.2 Monitor de Transportes");
    addTextBlock(s, "Painel em tempo real para equipes de transporte e centrais (SAMU/COFIH) acompanharem o deslocamento de cada paciente.", 0.6, 1.9, 12, 0.8, 14);
    addBullets(s, [
      "Status de cada transporte: Aguardando, Em Deslocamento, Concluído, Com Intercorrência",
      "Alertas de transportes parados ou com tempo excedido",
      "Equipe responsável, tipo de transporte e central",
      "Origem e destino de cada paciente",
      "Registro de intercorrências com relatório em PDF",
      "Histórico completo de cada transporte"
    ], 0.8, 2.9, 11.5, 3.5, 14);
    addFooter(s, 30, TOTAL);

    // ═════════════ SLIDE 31 — PAINEL ASSISTENCIAL ═════════════
    s = pptx.addSlide();
    addHeader(s, pptx);
    addTitleBar(s, pptx, "8.3 Painel Assistencial");
    addTextBlock(s, "Registro completo de todos os pacientes atendidos pela unidade de saúde, com filtros e exportação.", 0.6, 1.9, 12, 0.8, 14);
    addBullets(s, [
      "Busca por nome do paciente",
      "Filtro por unidade de saúde, período e status",
      "Contadores de pacientes por status",
      "Exportação para Excel e PDF",
      "Reabertura de triagem (re-triagem) quando necessário",
      "Acesso ao detalhamento completo de cada caso",
      "Envio de formulário/vaga para regulação"
    ], 0.8, 2.9, 11.5, 3.5, 14);
    addFooter(s, 31, TOTAL);

    // ═════════════ SLIDE 32 — PAINEL DE REGULAÇÃO ═════════════
    s = pptx.addSlide();
    addHeader(s, pptx);
    addTitleBar(s, pptx, "8.4 Painel de Regulação");
    addTextBlock(s, "Visão consolidada para CERH, ASSCARDIO, Hemodinâmica e Transporte filtrarem e processarem casos por perfil.", 0.6, 1.9, 12, 0.8, 14);
    addBullets(s, [
      "Estatísticas de pacientes por status e prioridade",
      "Filtros por macrorregião e unidade de saúde",
      "Identificação de janela terapêutica e prioridade clínica",
      "Ações específicas por equipe (parecer, transporte, ICP)",
      "Download de relatórios de triagem",
      "Indicadores de performance da rede em tempo real"
    ], 0.8, 2.9, 11.5, 3.5, 14);
    addFooter(s, 32, TOTAL);

    // ═════════════ SLIDE 33 — HOSPITAIS ESTADUAIS ═════════════
    s = pptx.addSlide();
    addHeader(s, pptx);
    addTitleBar(s, pptx, "8.5 Hospitais Estaduais + UPA Pedro Isabel");
    addTextBlock(s, "O CARDIOPB integra a rede de 11 hospitais estaduais e a UPA Pedro Isabel, garantindo cobertura ampla do território paraibano.", 0.6, 1.9, 12, 0.8, 14);
    addBullets(s, [
      "Hospital de Emergência e Trauma Dom Luiz Gonzaga Fernandes (JP)",
      "Hospital Universitário Lauro Wanderley (UFPB)",
      "Hospital Regional de Guarabira — Antonio Paulino Filho",
      "Hospital Regional de Sousa — Cleofas Pereira de Almeida",
      "Hospital Regional de Cajazeiras — Antonio Targino de Melo",
      "Hospital Regional de Campina Grande",
      "Hospital Regional de Patos",
      "Hospital Regional de Itabaiana",
      "Hospital de Trauma de Campina Grande",
      "UPA Pedro Isabel (João Pessoa)",
      "Demais unidades de pronto-atendimento estaduais e municipais"
    ], 0.8, 2.8, 11.5, 3.8, 12);
    addFooter(s, 33, TOTAL);

    // ═════════════ SLIDE 34 — UNIDADES DE PRONTO ATENDIMENTO ═════════════
    s = pptx.addSlide();
    addHeader(s, pptx);
    addTitleBar(s, pptx, "8.6 Demais Unidades de Pronto Atendimento");
    addTextBlock(s, "Além dos hospitais estaduais, o CARDIOPB integra unidades municipais e estaduais de pronto-atendimento em todas as macrorregiões de saúde do estado.", 0.6, 1.9, 12, 0.9, 14);
    addBullets(s, [
      "Cobertura das três macrorregiões: Macro 1, Macro 2 e Macro 3",
      "Unidades municipais e estaduais de pronto-atendimento",
      "Seleção em cascata: Macrorregião → Cidade → Unidade de Saúde",
      "Cadastro centralizado das unidades no sistema",
      "Cada unidade com seu perfil de acesso e equipe vinculada",
      "Permite identificação da origem de cada paciente no fluxo",
      "Facilita a regulação por proximidade geográfica"
    ], 0.8, 2.9, 11.5, 3.5, 13);
    addFooter(s, 34, TOTAL);

    // ═════════════ SLIDE 35 — ARQUITETURA (VISÃO GERAL) ═════════════
    s = pptx.addSlide();
    addHeader(s, pptx);
    addTitleBar(s, pptx, "9. Arquitetura Tecnológica — Visão Geral");
    const camadas = [
      { t: "Front-end", d: "React + Tailwind CSS — interface web e mobile", y: 2.0 },
      { t: "SDK Base44", d: "Comunicação com backend, autenticação e RLS", y: 3.0 },
      { t: "Back-end (BaaS)", d: "Funções Deno + integrações (Core, UploadFile, LLM)", y: 4.0 },
      { t: "Banco de Dados", d: "MongoDB gerenciado — entidades JSON documentais", y: 5.0 }
    ];
    camadas.forEach((c, i) => {
      s.addShape(pptx.ShapeType.roundRect, { x: 1.5, y: c.y, w: 10, h: 0.8, fill: { color: i === 0 ? RED : i === 3 ? RED_DARK : "B91C1C" } });
      s.addText(c.t, { x: 1.7, y: c.y, w: 3, h: 0.8, fontSize: 14, bold: true, color: "FFFFFF", valign: "middle" });
      s.addText(c.d, { x: 5, y: c.y, w: 6.3, h: 0.8, fontSize: 12, color: "FECACA", valign: "middle" });
    });
    s.addText("Infraestrutura de nuvem certificada (AWS/GCP) com criptografia TLS em trânsito e em repouso.", { x: 1.5, y: 6.1, w: 10, h: 0.5, fontSize: 11, color: GRAY, align: "center" });
    addFooter(s, 35, TOTAL);

    // ═════════════ SLIDE 36 — 9.1 INDICADORES DE QUALIDADE — VISÃO GERAL ═════════════
    s = pptx.addSlide();
    addHeader(s, pptx);
    addTitleBar(s, pptx, "9.1 Indicadores de Qualidade — Visão Geral");
    addTextBlock(s, "O CARDIOPB gera indicadores de qualidade e epidemiológicos em tempo real, exportáveis em PDF e Excel, para a gestão pública da rede cardiovascular.", 0.6, 1.9, 12, 0.8, 14);
    const indsGeral = [
      { v: "≤ 10 min", l: "Triagem → ECG" },
      { v: "≤ 30 min", l: "Porta → Agulha" },
      { v: "≤ 90 min", l: "Porta → Balão" },
      { v: "Real-time", l: "Monitor Transportes" }
    ];
    indsGeral.forEach((ind, i) => {
      const x = 0.5 + i * 3.1;
      s.addShape(pptx.ShapeType.roundRect, { x, y: 3.0, w: 2.9, h: 1.8, fill: { color: RED } });
      s.addText(ind.v, { x, y: 3.2, w: 2.9, h: 0.9, fontSize: 28, bold: true, color: "FFFFFF", align: "center", valign: "middle" });
      s.addText(ind.l, { x, y: 4.15, w: 2.9, h: 0.5, fontSize: 12, color: "FECACA", align: "center", valign: "middle" });
    });
    addBullets(s, [
      "Distribuição por classificação de risco e tipo de SCA",
      "Tempo médio por etapa do fluxo do paciente",
      "Percentual de pacientes dentro da janela terapêutica",
      "Taxa de ICP realizadas e reperfusão efetiva",
      "Envio automático de indicadores ao IAMPBSAUDE"
    ], 0.8, 5.2, 11.5, 1.5, 12);
    addFooter(s, 36, TOTAL);

    // ═════════════ SLIDE 37 — 9.2 TEMPO-CORAÇÃO (GRÁFICO) ═════════════
    s = pptx.addSlide();
    addHeader(s, pptx);
    addTitleBar(s, pptx, "9.2 Indicadores Operacionais — Tempo-Coração");
    addTextBlock(s, "Comparativo entre a meta estabelecida pelo protocolo e o tempo médio realizado pela rede (em minutos).", 0.6, 1.9, 12, 0.7, 13);
    const chartTempo = [
      { name: "Meta (min)", labels: ["Triagem-ECG", "Porta-Agulha", "Porta-Balão", "FMC-Device"], values: [10, 30, 90, 120] },
      { name: "Realizado (min)", labels: ["Triagem-ECG", "Porta-Agulha", "Porta-Balão", "FMC-Device"], values: [8, 27, 82, 105] }
    ];
    s.addChart(pptx.ChartType.bar, chartTempo, {
      x: 0.5, y: 2.7, w: 12, h: 4.0,
      barDir: "col", showLegend: true, legendPos: "b",
      showValue: true, valueFontSize: 10,
      chartColors: ["C11528", "8B0E20"],
      catAxisLabelFontSize: 11, valAxisLabelFontSize: 10,
      title: "Tempo-Coração: Meta vs Realizado (minutos)",
      titleFontSize: 13
    });
    addFooter(s, 37, TOTAL);

    // ═════════════ SLIDE 38 — 9.3 CLASSIFICAÇÃO DE RISCO ═════════════
    s = pptx.addSlide();
    addHeader(s, pptx);
    addTitleBar(s, pptx, "9.3 Distribuição por Classificação de Risco");
    addTextBlock(s, "Distribuição dos pacientes triados por nível de classificação de risco da enfermagem.", 0.6, 1.9, 12, 0.7, 13);
    const chartRisco = [{ name: "Classificação", labels: ["Vermelha", "Laranja", "Amarela", "Verde"], values: [35, 28, 22, 15] }];
    s.addChart(pptx.ChartType.pie, chartRisco, {
      x: 0.5, y: 2.7, w: 6, h: 4.0,
      showLegend: true, legendPos: "r", showPercent: true,
      chartColors: ["DC2626", "F97316", "EAB308", "16A34A"],
      showValue: true, valueFontSize: 12,
      title: "Classificação de Risco (%)",
      titleFontSize: 12
    });
    s.addText([
      { text: "Vermelha: Emergência — imediato\n", options: { fontSize: 13, color: "DC2626", bold: true } },
      { text: "Laranja: Muito urgente — ≤ 10 min\n", options: { fontSize: 13, color: "F97316", bold: true } },
      { text: "Amarela: Urgente — ≤ 60 min\n", options: { fontSize: 13, color: "CA8A04", bold: true } },
      { text: "Verde: Pouco urgente — ≤ 120 min", options: { fontSize: 13, color: "16A34A", bold: true } }
    ], { x: 7, y: 3.2, w: 5.5, h: 3, lineSpacingMultiple: 1.8, valign: "middle" });
    addFooter(s, 38, TOTAL);

    // ═════════════ SLIDE 39 — 9.4 TIPO DE SCA ═════════════
    s = pptx.addSlide();
    addHeader(s, pptx);
    addTitleBar(s, pptx, "9.4 Indicadores Epidemiológicos — Tipo de SCA");
    addTextBlock(s, "Distribuição dos casos confirmados por tipo de Síndrome Coronariana Aguda.", 0.6, 1.9, 12, 0.7, 13);
    const chartSCA = [{ name: "Casos", labels: ["SCACEST", "SCASEST c/ Troponina", "SCASEST s/ Troponina"], values: [45, 35, 20] }];
    s.addChart(pptx.ChartType.bar, chartSCA, {
      x: 0.5, y: 2.7, w: 12, h: 4.0,
      barDir: "col", showLegend: false, showValue: true,
      chartColors: ["C11528"],
      catAxisLabelFontSize: 12, valueFontSize: 12,
      title: "Distribuição por Tipo de SCA (%)",
      titleFontSize: 13
    });
    addFooter(s, 39, TOTAL);

    // ═════════════ SLIDE 40 — 9.5 TEMPO POR ETAPA ═════════════
    s = pptx.addSlide();
    addHeader(s, pptx);
    addTitleBar(s, pptx, "9.5 Tempo Médio por Etapa do Fluxo");
    addTextBlock(s, "Tempo médio gasto em cada etapa do fluxo do paciente, do início da triagem ao desfecho na hemodinâmica (em minutos).", 0.6, 1.9, 12, 0.7, 13);
    const chartEtapas = [{ name: "Tempo (min)", labels: ["Triagem", "Triagem Méd.", "Assessoria", "Regulação", "Transporte", "Hemodinâmica"], values: [15, 20, 25, 30, 45, 60] }];
    s.addChart(pptx.ChartType.bar, chartEtapas, {
      x: 0.5, y: 2.7, w: 12, h: 4.0,
      barDir: "col", showLegend: false, showValue: true,
      chartColors: ["C11528"],
      catAxisLabelFontSize: 11, valueFontSize: 11,
      title: "Tempo Médio por Etapa (minutos)",
      titleFontSize: 13
    });
    addFooter(s, 40, TOTAL);

    // ═════════════ SLIDE 41 — 9.6 JANELA TERAPÊUTICA ═════════════
    s = pptx.addSlide();
    addHeader(s, pptx);
    addTitleBar(s, pptx, "9.6 Percentual na Janela Terapêutica");
    addTextBlock(s, "Percentual de pacientes atendidos dentro da janela terapêutica ideal para cada indicador.", 0.6, 1.9, 12, 0.7, 13);
    const chartJanela = [{ name: "Janela", labels: ["Dentro da Meta", "Fora da Meta"], values: [78, 22] }];
    s.addChart(pptx.ChartType.doughnut, chartJanela, {
      x: 0.5, y: 2.7, w: 6, h: 4.0,
      showLegend: true, legendPos: "r", showPercent: true,
      chartColors: ["16A34A", "DC2626"],
      holeSize: 50,
      title: "Aderência à Janela Terapêutica",
      titleFontSize: 12
    });
    s.addText([
      { text: "78% dentro da meta\n", options: { fontSize: 16, bold: true, color: "16A34A" } },
      { text: "22% fora da meta\n\n", options: { fontSize: 16, bold: true, color: "DC2626" } },
      { text: "Identificação em tempo real de gargalos permite intervenção imediata da gestão para correção de fluxo.", options: { fontSize: 13, color: DARK } }
    ], { x: 7, y: 3.2, w: 5.5, h: 3.5, valign: "middle", lineSpacingMultiple: 1.4 });
    addFooter(s, 41, TOTAL);

    // ═════════════ SLIDE 42 — 9.7 ICP E REPERFUSÃO ═════════════
    s = pptx.addSlide();
    addHeader(s, pptx);
    addTitleBar(s, pptx, "9.7 Taxa de ICP e Reperfusão Efetiva");
    addTextBlock(s, "Indicadores de resultado: ICP realizadas, reperfusão efetiva e desfechos clínicos.", 0.6, 1.9, 12, 0.7, 13);
    const chartICP = [{ name: "Percentual", labels: ["ICP Realizada", "Reperfusão Efetiva", "Trombólise", "Complicações", "Óbito"], values: [88, 82, 45, 12, 6] }];
    s.addChart(pptx.ChartType.bar, chartICP, {
      x: 0.5, y: 2.7, w: 12, h: 4.0,
      barDir: "col", showLegend: false, showValue: true,
      chartColors: ["C11528"],
      catAxisLabelFontSize: 11, valueFontSize: 12,
      title: "Indicadores de Desfecho (%)",
      titleFontSize: 13
    });
    addFooter(s, 42, TOTAL);

    // ═════════════ SLIDE 43 — 9.8 MACRORREGIÕES ═════════════
    s = pptx.addSlide();
    addHeader(s, pptx);
    addTitleBar(s, pptx, "9.8 Distribuição por Macrorregião");
    addTextBlock(s, "Distribuição dos atendimentos por macrorregião de saúde do estado da Paraíba.", 0.6, 1.9, 12, 0.7, 13);
    const chartMacro = [{ name: "Casos", labels: ["Macro 1", "Macro 2", "Macro 3"], values: [120, 85, 65] }];
    s.addChart(pptx.ChartType.bar, chartMacro, {
      x: 0.5, y: 2.7, w: 7, h: 4.0,
      barDir: "col", showLegend: false, showValue: true,
      chartColors: ["C11528"],
      catAxisLabelFontSize: 13, valueFontSize: 12,
      title: "Atendimentos por Macrorregião",
      titleFontSize: 12
    });
    s.addText([
      { text: "Macro 1 — João Pessoa e litoral\n", options: { fontSize: 14, bold: true, color: RED } },
      { text: "Macro 2 — Campina Grande e região\n", options: { fontSize: 14, bold: true, color: RED } },
      { text: "Macro 3 — Patos, Sousa e sertão\n\n", options: { fontSize: 14, bold: true, color: RED } },
      { text: "Permite identificar gargalos regionais e direcionar investimentos em infraestrutura e capacitação.", options: { fontSize: 12, color: DARK } }
    ], { x: 7.8, y: 3.0, w: 5, h: 3.5, valign: "top", lineSpacingMultiple: 1.4 });
    addFooter(s, 43, TOTAL);

    // ═════════════ SLIDE 44 — 9.9 DASHBOARD CONSOLIDADO ═════════════
    s = pptx.addSlide();
    addHeader(s, pptx);
    addTitleBar(s, pptx, "9.9 Dashboard Consolidado da Rede");
    addTextBlock(s, "Visão executiva consolidada para a Secretaria de Estado da Saúde, com indicadores-chave em tempo real.", 0.6, 1.9, 12, 0.7, 13);
    const dashItems = [
      { v: "270", l: "Pacientes triados" },
      { v: "88%", l: "ICP realizadas" },
      { v: "82%", l: "Reperfusão efetiva" },
      { v: "78%", l: "Dentro da janela" }
    ];
    dashItems.forEach((d, i) => {
      const x = 0.5 + i * 3.1;
      s.addShape(pptx.ShapeType.roundRect, { x, y: 2.8, w: 2.9, h: 1.4, fill: { color: LIGHT_BG }, line: { color: RED, width: 1 } });
      s.addText(d.v, { x, y: 2.9, w: 2.9, h: 0.7, fontSize: 30, bold: true, color: RED, align: "center", valign: "middle" });
      s.addText(d.l, { x, y: 3.6, w: 2.9, h: 0.5, fontSize: 11, color: GRAY, align: "center", valign: "middle" });
    });
    const chartDash = [{ name: "Casos", labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"], values: [35, 42, 38, 48, 52, 55] }];
    s.addChart(pptx.ChartType.line, chartDash, {
      x: 0.5, y: 4.5, w: 7, h: 2.2,
      showLegend: false, showValue: false,
      chartColors: ["C11528"],
      catAxisLabelFontSize: 10, valAxisLabelFontSize: 9,
      title: "Evolução de Atendimentos (6 meses)",
      titleFontSize: 11
    });
    s.addText([
      { text: "Tendência mensal de atendimentos\n", options: { fontSize: 13, bold: true, color: DARK } },
      { text: "Crescimento de 57% no semestre\n", options: { fontSize: 12, color: GRAY } },
      { text: "Indicadores exportáveis em PDF e Excel\n", options: { fontSize: 12, color: GRAY } },
      { text: "Filtros por período, unidade e macrorregião", options: { fontSize: 12, color: GRAY } }
    ], { x: 7.8, y: 4.6, w: 5, h: 2, valign: "top", lineSpacingMultiple: 1.5 });
    addFooter(s, 44, TOTAL);

    // ═════════════ SLIDE 45 — 9.10 PAINEL CERH ═════════════
    s = pptx.addSlide();
    addHeader(s, pptx);
    addTitleBar(s, pptx, "9.10 Painel de Regulação — Visão CERH");
    addTextBlock(s, "Painel da Central de Regulação de Hipocorrendência (CERH) para processamento e destino dos casos.", 0.6, 1.9, 12, 0.8, 13);
    addBullets(s, [
      "Estatísticas de pacientes por status e prioridade clínica",
      "Identificação automática de janela terapêutica e prioridade",
      "Filtros por macrorregião e unidade de saúde",
      "Ações: parecer do regulador, liberação de vaga, conduta final",
      "Senha SES para transporte sanitário gerada no painel",
      "Solicitação de reavaliação de conduta pela unidade de origem",
      "Histórico de pareceres retificados documentado",
      "Indicadores de performance da regulação em tempo real"
    ], 0.8, 2.9, 11.5, 3.8, 13);
    addFooter(s, 45, TOTAL);

    // ═════════════ SLIDE 46 — 9.11 PAINEL ASSCARDIO ═════════════
    s = pptx.addSlide();
    addHeader(s, pptx);
    addTitleBar(s, pptx, "9.11 Painel ASSCARDIO — Assessoria Cardiológica");
    addTextBlock(s, "Painel da equipe de assessoria cardiológica (ASSCARDIO) para emissão de pareceres especializados à distância.", 0.6, 1.9, 12, 0.8, 13);
    addBullets(s, [
      "Parecer do cardiologista: diagnóstico e estratégia definida",
      "Indicação de hemodinâmica (sim/não) e classificação de urgência",
      "Cálculo do HEART Score pela assessoria (0-10 pontos)",
      "Análise de ECG com e sem supra de ST",
      "Recomendação de estratégia: ICP primária, trombólise ou conservador",
      "Confirmação ou retificação da triagem da unidade de origem",
      "Pré-parecer e rascunho salvos automaticamente",
      "Conexão remota com unidades de saúde de toda a rede"
    ], 0.8, 2.9, 11.5, 3.8, 13);
    addFooter(s, 46, TOTAL);

    // ═════════════ SLIDE 47 — 9.12 MONITOR DE TRANSPORTE ═════════════
    s = pptx.addSlide();
    addHeader(s, pptx);
    addTitleBar(s, pptx, "9.12 Monitor de Transporte em Tempo Real");
    addTextBlock(s, "Painel em tempo real para equipes de transporte e centrais (SAMU/COFIH) acompanharem cada deslocamento.", 0.6, 1.9, 12, 0.8, 13);
    const transpStats = [
      { v: "12", l: "Em Deslocamento" },
      { v: "5", l: "Aguardando" },
      { v: "28", l: "Concluídos (dia)" },
      { v: "2", l: "Com Intercorrência" }
    ];
    transpStats.forEach((st, i) => {
      const x = 0.5 + i * 3.1;
      s.addShape(pptx.ShapeType.roundRect, { x, y: 2.8, w: 2.9, h: 1.3, fill: { color: i === 3 ? "DC2626" : RED } });
      s.addText(st.v, { x, y: 2.9, w: 2.9, h: 0.7, fontSize: 26, bold: true, color: "FFFFFF", align: "center", valign: "middle" });
      s.addText(st.l, { x, y: 3.55, w: 2.9, h: 0.5, fontSize: 11, color: "FECACA", align: "center", valign: "middle" });
    });
    addBullets(s, [
      "Status de cada transporte: Aguardando, Em Deslocamento, Concluído, Intercorrência",
      "Alertas de transportes parados ou com tempo excedido",
      "Equipe responsável, tipo de transporte e central de origem",
      "Origem e destino de cada paciente em tempo real",
      "Registro de intercorrências com relatório em PDF assinado",
      "Histórico completo de cada transporte documentado"
    ], 0.8, 4.4, 11.5, 2.5, 12);
    addFooter(s, 47, TOTAL);

    // ═════════════ SLIDE 48 — 9.13 INTERCORRÊNCIAS ═════════════
    s = pptx.addSlide();
    addHeader(s, pptx);
    addTitleBar(s, pptx, "9.13 Gestão de Intercorrências de Transportes");
    addTextBlock(s, "Registro e acompanhamento de intercorrências durante o transporte sanitário de pacientes.", 0.6, 1.9, 12, 0.8, 13);
    const chartInter = [{ name: "Ocorrências", labels: ["Sem intercorrência", "Atraso", "Instabilidade clínica", "Falha veicular", "Outros"], values: [75, 10, 8, 4, 3] }];
    s.addChart(pptx.ChartType.pie, chartInter, {
      x: 0.5, y: 2.8, w: 6.5, h: 4.0,
      showLegend: true, legendPos: "r", showPercent: true,
      chartColors: ["16A34A", "F59E0B", "DC2626", "6B7280", "8B5CF6"],
      showValue: true, valueFontSize: 11,
      title: "Tipos de Intercorrências (%)",
      titleFontSize: 12
    });
    s.addText([
      { text: "Registro detalhado\n", options: { fontSize: 14, bold: true, color: RED } },
      { text: "• Data/hora e motivo da intercorrência\n", options: { fontSize: 12, color: DARK } },
      { text: "• Descrição detalhada do evento\n", options: { fontSize: 12, color: DARK } },
      { text: "• Ações tomadas pela equipe\n", options: { fontSize: 12, color: DARK } },
      { text: "• Relatório em PDF com assinatura digital\n", options: { fontSize: 12, color: DARK } },
      { text: "• Histórico por paciente documentado", options: { fontSize: 12, color: DARK } }
    ], { x: 7.3, y: 3.0, w: 5.5, h: 3.5, valign: "top", lineSpacingMultiple: 1.5 });
    addFooter(s, 48, TOTAL);

    // ═════════════ SLIDE 49 — 9.14 HEMODINÂMICA ═════════════
    s = pptx.addSlide();
    addHeader(s, pptx);
    addTitleBar(s, pptx, "9.14 Painel de Hemodinâmica — ICP");
    addTextBlock(s, "Painel das equipes de hemodinâmica para registro e acompanhamento das Intervenções Coronarianas Percutâneas.", 0.6, 1.9, 12, 0.8, 13);
    addBullets(s, [
      "Tipo de ICP: imediata, até 24h, até 72h, trombólise-ICP de resgate",
      "Data/hora de chegada, início e fim do procedimento",
      "Tempo FMC-to-Device (First Medical Contact) calculado",
      "Procedimento realizado e ICP realizada (sim/não)",
      "Reperfusão efetiva registrada",
      "Intercorrências durante o procedimento documentadas",
      "Desfecho: Sucesso, Complicações ou Óbito",
      "Tempo Porta-Balão calculado automaticamente"
    ], 0.8, 2.9, 11.5, 3.8, 13);
    addFooter(s, 49, TOTAL);

    // ═════════════ SLIDE 50 — 9.15 FMC-TO-DEVICE E DESFECHOS ═════════════
    s = pptx.addSlide();
    addHeader(s, pptx);
    addTitleBar(s, pptx, "9.15 Tempo FMC-to-Device e Desfechos Clínicos");
    addTextBlock(s, "Evolução do tempo FMC-to-Device e distribuição dos desfechos clínicos dos procedimentos.", 0.6, 1.9, 12, 0.7, 13);
    const chartFMC = [{ name: "Tempo (min)", labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"], values: [115, 108, 98, 95, 88, 82] }];
    s.addChart(pptx.ChartType.line, chartFMC, {
      x: 0.5, y: 2.6, w: 7, h: 2.2,
      showLegend: false, showValue: true, valueFontSize: 9,
      chartColors: ["C11528"],
      catAxisLabelFontSize: 9, valAxisLabelFontSize: 9,
      title: "Evolução do Tempo FMC-to-Device (min)",
      titleFontSize: 11
    });
    const chartDesf = [{ name: "Desfecho", labels: ["Sucesso", "Complicações", "Óbito"], values: [82, 12, 6] }];
    s.addChart(pptx.ChartType.pie, chartDesf, {
      x: 7.8, y: 2.6, w: 5, h: 2.5,
      showLegend: true, legendPos: "b", showPercent: true,
      chartColors: ["16A34A", "F59E0B", "DC2626"],
      showValue: true, valueFontSize: 10,
      title: "Desfechos Clínicos (%)",
      titleFontSize: 11
    });
    s.addText("Redução de 28% no tempo FMC-to-Device no semestre, demonstrando a melhoria contínua da rede com o uso do CARDIOPB.", { x: 0.8, y: 5.2, w: 11.5, h: 1, fontSize: 13, color: DARK, valign: "middle", lineSpacingMultiple: 1.3 });
    addFooter(s, 50, TOTAL);

    // ═════════════ SLIDE 51 — 9.16 PAINEL ASSISTENCIAL ═════════════
    s = pptx.addSlide();
    addHeader(s, pptx);
    addTitleBar(s, pptx, "9.16 Painel Assistencial — Filtros e Exportação");
    addTextBlock(s, "Registro completo dos pacientes atendidos pela unidade de saúde, com filtros e exportação.", 0.6, 1.9, 12, 0.8, 13);
    addBullets(s, [
      "Busca por nome do paciente",
      "Filtro por unidade de saúde, período (data inicial/final) e status",
      "Contadores de pacientes por status atualizados em tempo real",
      "Exportação para Excel e PDF com um clique",
      "Reabertura de triagem (re-triagem) quando necessário",
      "Acesso ao detalhamento completo de cada caso",
      "Envio de formulário/vaga para a regulação central",
      "Visualização do histórico de etapas e pareceres"
    ], 0.8, 2.9, 11.5, 3.8, 13);
    addFooter(s, 51, TOTAL);

    // ═════════════ SLIDE 52 — 9.17 PAINEL DE REGULAÇÃO — FILTROS ═════════════
    s = pptx.addSlide();
    addHeader(s, pptx);
    addTitleBar(s, pptx, "9.17 Painel de Regulação — Filtros e Prioridades");
    addTextBlock(s, "Visão consolidada para CERH, ASSCARDIO, Hemodinâmica e Transporte filtrarem e processarem casos por perfil.", 0.6, 1.9, 12, 0.8, 13);
    addBullets(s, [
      "Estatísticas de pacientes por status e prioridade clínica",
      "Filtros por macrorregião e unidade de saúde",
      "Identificação automática de janela terapêutica e prioridade",
      "Ações específicas por equipe (parecer, transporte, ICP)",
      "Download de relatórios de triagem em PDF",
      "Indicadores de performance da rede em tempo real",
      "Identificação de pacientes fora da janela terapêutica ideal",
      "Direcionamento de recursos para onde a vida está em maior risco"
    ], 0.8, 2.9, 11.5, 3.8, 13);
    addFooter(s, 52, TOTAL);

    // ═════════════ SLIDE 53 — 9.18 ENVIO AO IAMPBSAUDE ═════════════
    s = pptx.addSlide();
    addHeader(s, pptx);
    addTitleBar(s, pptx, "9.18 Envio Automático de Indicadores ao IAMPBSAUDE");
    addTextBlock(s, "O CARDIOPB envia automaticamente indicadores epidemiológicos e operacionais ao sistema IAMPBSAUDE do estado.", 0.6, 1.9, 12, 0.8, 13);
    addBullets(s, [
      "Envio automatizado via função de backend (backend function)",
      "Indicadores de qualidade: tempo triagem-ECG, porta-agulha, porta-balão",
      "Indicadores epidemiológicos: tipo de SCA, classificação de risco, desfechos",
      "Frequência programada (agendada) sem intervenção manual",
      "Integração via API com URL de ingestão segura",
      "Autenticação via chave de API dedicada",
      "Redução de retrabalho e erro manual no repasse de dados",
      "Padronização dos dados enviados ao sistema estadual"
    ], 0.8, 2.9, 11.5, 3.8, 13);
    addFooter(s, 53, TOTAL);

    // ═════════════ SLIDE 54 — 9.19 RELATÓRIOS EXPORTÁVEIS ═════════════
    s = pptx.addSlide();
    addHeader(s, pptx);
    addTitleBar(s, pptx, "9.19 Relatórios Exportáveis (PDF e Excel)");
    addTextBlock(s, "Todos os relatórios e indicadores são exportáveis em PDF e Excel, gerados no navegador sem custo de servidor.", 0.6, 1.9, 12, 0.8, 13);
    const relatorios = [
      { t: "Relatório de Triagem", d: "Dados completos do paciente, triagem e classificação" },
      { t: "Relatório de Transporte", d: "Intercorrências e histórico do deslocamento" },
      { t: "Relatório de Hemodinâmica", d: "ICP, tempos e desfecho clínico" },
      { t: "Relatório de Trombólise", d: "Prescrição, administração e lotes" },
      { t: "Indicadores Epidemiológicos", d: "Gráficos e tabelas em PDF e Excel" },
      { t: "Relatório Farmacêutico", d: "Consumo de trombolíticos por unidade" }
    ];
    relatorios.forEach((r, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 0.8 + col * 6;
      const y = 2.9 + row * 1.2;
      s.addShape(pptx.ShapeType.roundRect, { x, y, w: 5.5, h: 1, fill: { color: LIGHT_BG }, line: { color: RED, width: 0.5 } });
      s.addShape(pptx.ShapeType.rect, { x, y, w: 0.08, h: 1, fill: { color: RED } });
      s.addText(r.t, { x: x + 0.2, y, w: 5.2, h: 0.5, fontSize: 13, bold: true, color: DARK, valign: "bottom" });
      s.addText(r.d, { x: x + 0.2, y: y + 0.5, w: 5.2, h: 0.4, fontSize: 10, color: GRAY, valign: "top" });
    });
    addFooter(s, 54, TOTAL);

    // ═════════════ SLIDE 55 — SEGURANÇA (RLS) ═════════════
    s = pptx.addSlide();
    addHeader(s, pptx);
    addTitleBar(s, pptx, "9.3 Segurança e Controle de Acesso (RLS)");
    addTextBlock(s, "O sistema implementa Row-Level Security (RLS) em todas as entidades, restringindo o acesso aos dados conforme o perfil do usuário.", 0.6, 1.9, 12, 0.9, 14);
    addBullets(s, [
      "UNIDADE_SAUDE — acessa apenas pacientes da sua unidade",
      "CERH — acessa casos da sua macrorregião de regulação",
      "ASSCARDIO — acessa casos destinados à assessoria cardiológica",
      "TRANSPORTE — acessa transportes atribuídos à sua equipe",
      "HEMODINAMICA — acessa casos destinados ao seu centro",
      "GESTOR_DE_FARMACIA — acessa relatórios farmacêuticos",
      "ADMINISTRADOR_MASTER — acesso pleno administrativo",
      "Garantia de que cada profissional acessa apenas o pertinente ao seu papel"
    ], 0.8, 3.0, 11.5, 3.5, 13);
    addFooter(s, 55, TOTAL);

    // ═════════════ SLIDE 56 — AUDITORIA ═════════════
    s = pptx.addSlide();
    addHeader(s, pptx);
    addTitleBar(s, pptx, "9.4 Auditoria");
    addTextBlock(s, "Toda ação crítica é registrada na entidade LogAuditoria, garantindo rastreabilidade completa das operações.", 0.6, 1.9, 12, 0.8, 14);
    addBullets(s, [
      "Usuário que realizou a ação (email e nome)",
      "Data e hora da operação",
      "IP de origem da requisição",
      "Tipo de ação: criar, atualizar, deletar, visualizar, login, gerar relatório, transferir, concluir",
      "Dados anteriores e novos (para atualizações)",
      "Campos alterados listados",
      "Nível de severidade: info, aviso, crítico",
      "Retenção de registros EXCLUÍDOS para fins de auditoria (LGPD)"
    ], 0.8, 2.9, 11.5, 3.8, 13);
    addFooter(s, 56, TOTAL);

    // ═════════════ SLIDE 57 — CRIPTOGRAFIA ═════════════
    s = pptx.addSlide();
    addHeader(s, pptx);
    addTitleBar(s, pptx, "9.5 Criptografia");
    addTextBlock(s, "Os dados são protegidos em todas as etapas de transporte e armazenamento.", 0.6, 1.9, 12, 0.7, 14);
    addBullets(s, [
      "Criptografia em trânsito: TLS/HTTPS em toda comunicação",
      "Criptografia em repouso: padrões da infraestrutura de nuvem (AWS/GCP)",
      "Assinatura digital com hash de confirmação para documentos clínicos",
      "Página pública de verificação de autenticidade (/verificar)",
      "Tokens de sessão gerenciados pelo SDK da Base44",
      "Autenticação federal via GOV.BR (identidade validada)",
      "Row-Level Security em todas as entidades"
    ], 0.8, 2.7, 11.5, 4, 14);
    addFooter(s, 57, TOTAL);

    // ═════════════ SLIDE 58 — LGPD ═════════════
    s = pptx.addSlide();
    addHeader(s, pptx);
    addTitleBar(s, pptx, "10. Conformidade com a LGPD");
    addTextBlock(s, "O sistema possui mecanismos alinhados à Lei Geral de Proteção de Dados (Lei nº 13.709/2018), incluindo dados sensíveis de saúde (Art. 11).", 0.6, 1.9, 12, 1, 13);
    addBullets(s, [
      "Controle de acesso baseado em perfis (RLS) — minimização de acesso",
      "Trilha de auditoria completa (LogAuditoria) com IP, usuário e timestamp",
      "Assinatura digital e códigos de confirmação para documentos clínicos",
      "Página pública de verificação de autenticidade de documentos",
      "Status EXCLUÍDO para retenção de registros para fins de auditoria",
      "Recomendação: formalização de DPA (Data Processing Agreement) entre o órgão e a Base44"
    ], 0.8, 3.0, 11.5, 3.5, 14);
    addFooter(s, 58, TOTAL);

    // ═════════════ SLIDE 59 — DESENVOLVEDOR ═════════════
    s = pptx.addSlide();
    addHeader(s, pptx);
    addTitleBar(s, pptx, "Desenvolvedor Responsável");
    s.addShape(pptx.ShapeType.roundRect, { x: 1.5, y: 2.3, w: 10, h: 3.5, fill: { color: "FEF2F2" }, line: { color: RED, width: 2 } });
    s.addText("Walber A. Frazão Jr.", { x: 1.5, y: 2.7, w: 10, h: 0.8, fontSize: 28, bold: true, color: RED, align: "center" });
    s.addText("Enfermeiro Cardio-Emergencista e Auditor", { x: 1.5, y: 3.6, w: 10, h: 0.5, fontSize: 16, color: DARK, align: "center" });
    s.addText("COREN 110.238", { x: 1.5, y: 4.2, w: 10, h: 0.5, fontSize: 18, bold: true, color: RED_DARK, align: "center" });
    s.addText("Apoio Técnico: Dr. Lucas Lima e Dr. Ivson Braga", { x: 1.5, y: 4.9, w: 10, h: 0.4, fontSize: 12, color: GRAY, align: "center" });
    s.addText("Equipe Gerência de TI da SES e da CODATA", { x: 1.5, y: 5.3, w: 10, h: 0.4, fontSize: 12, color: GRAY, align: "center" });
    addFooter(s, 59, TOTAL);

    // ═════════════ SLIDE 60 — ENCERRAMENTO ═════════════
    s = pptx.addSlide();
    s.background = { color: RED };
    s.addImage({ path: LOGO_CARDIOPB, x: 4.6, y: 1.5, w: 4.1, h: 1.1 });
    s.addText("CARDIOPB", { x: 0.5, y: 2.8, w: 12.3, h: 0.7, fontSize: 36, bold: true, color: "FFFFFF", align: "center" });
    s.addText("Programa Coração Paraibano", { x: 0.5, y: 3.5, w: 12.3, h: 0.4, fontSize: 16, color: "FFFFFF", align: "center" });
    s.addShape(pptx.ShapeType.rect, { x: 4.6, y: 4.1, w: 4.1, h: 0.03, fill: { color: "FFFFFF" } });
    s.addText("Obrigado pela atenção.", { x: 0.5, y: 4.4, w: 12.3, h: 0.5, fontSize: 20, color: "FFFFFF", align: "center" });
    s.addText("Triagem e Regulação Médica do IAM da Paraíba", { x: 0.5, y: 5.0, w: 12.3, h: 0.4, fontSize: 14, color: "FECACA", align: "center" });
    s.addText("Walber A. Frazão Jr. — COREN 110.238", { x: 0.5, y: 5.5, w: 12.3, h: 0.35, fontSize: 13, color: "FECACA", align: "center" });
    s.addText("Secretaria de Estado da Saúde da Paraíba (SES-PB)", { x: 0.5, y: 5.9, w: 12.3, h: 0.35, fontSize: 12, color: "FECACA", align: "center" });
    s.addImage({ path: LOGO_SECRETARIA, x: 2, y: 6.5, w: 1.8, h: 0.6 });
    s.addImage({ path: LOGO_COMPLEXO, x: 9.5, y: 6.5, w: 1.8, h: 0.6 });

    await pptx.writeFile({ fileName: "Apresentacao_CARDIOPB.pptx" });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <div className="bg-red-600 p-3 rounded-full">
              <Presentation className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-gray-900">Apresentação Institucional (PPT)</CardTitle>
          <CardDescription className="text-gray-600">
            Gera um arquivo PowerPoint (.pptx) com 60 slides para apresentação a autoridade sanitária, com o cabeçalho do app e imagens dos usuários da plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-700 mb-6">
            <p>✓ 60 slides profissionais (formato 16:9)</p>
            <p>✓ Cabeçalho com logos institucionais (SES, CARDIOPB, CRE)</p>
            <p>✓ Imagens ilustrativas dos 7 perfis de usuários</p>
            <p>✓ Fluxo completo do paciente (7 etapas)</p>
            <p>✓ Indicadores de qualidade e epidemiológicos com gráficos</p>
            <p>✓ Dashboards e painéis (CERH, ASSCARDIO, Transporte, Hemodinâmica)</p>
            <p>✓ Segurança, auditoria, criptografia e LGPD</p>
            <p>✓ Envio automático ao IAMPBSAUDE e relatórios exportáveis</p>
          </div>
          <Button onClick={gerarPPT} className="w-full bg-red-600 hover:bg-red-700 text-white">
            <Download className="w-4 h-4 mr-2" />
            Baixar Apresentação (.pptx)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}