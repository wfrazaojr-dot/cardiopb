import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const INGEST_URL = Deno.env.get("IAMPBSAUDE_INGEST_URL");
const API_KEY = Deno.env.get("CARDIOBP_API_KEY");

const MACROS = ["Macro 1", "Macro 2", "Macro 3"];

function diffMin(a, b) {
  if (!a || !b) return null;
  const d = Math.round((new Date(a).getTime() - new Date(b).getTime()) / 60000);
  return isNaN(d) ? null : d;
}

function calcMetric(tempos, meta) {
  const valid = tempos.filter(t => t !== null && !isNaN(t));
  if (valid.length === 0) return { media: 0, min: 0, max: 0, dentro_meta: 0, fora_meta: 0, total: 0 };
  return {
    media: Math.round(valid.reduce((a, b) => a + b, 0) / valid.length),
    min: Math.min(...valid),
    max: Math.max(...valid),
    dentro_meta: valid.filter(t => t <= meta).length,
    fora_meta: valid.filter(t => t > meta).length,
    total: valid.length
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    if (user.role !== 'admin' && user.email?.toLowerCase() !== 'wfrazaojr@gmail.com') {
      return Response.json({ error: 'Forbidden — apenas administradores' }, { status: 403 });
    }

    if (!INGEST_URL || !API_KEY) {
      return Response.json({ error: 'IAMPBSAUDE_INGEST_URL ou CARDIOBP_API_KEY não configurados' }, { status: 500 });
    }

    // Parâmetros opcionais: ano e mês (default: mês atual)
    let body = {};
    try { body = await req.json(); } catch (_) {}
    const ano = body.ano || new Date().getFullYear();
    const mes = body.mes || (new Date().getMonth() + 1); // 1-12; 0 = ano inteiro

    const referencePeriod = mes === 0 ? `${ano}` : `${ano}-${String(mes).padStart(2, '0')}`;

    // Buscar todos os pacientes (service role)
    const todosPacientes = await base44.asServiceRole.entities.Paciente.list("-created_date", 5000);

    // Filtrar por período (data_hora_chegada)
    const pacientesPeriodo = todosPacientes.filter(p => {
      if (!p.data_hora_chegada) return false;
      const d = new Date(p.data_hora_chegada);
      if (d.getFullYear() !== ano) return false;
      if (mes !== 0 && d.getMonth() + 1 !== mes) return false;
      return true;
    });

    // Construir payload por macrorregião + um consolidado "todas"
    const macrorregioes = [...MACROS, "todas"];
    const indicators = macrorregioes.map(macro => {
      const lista = macro === "todas"
        ? pacientesPeriodo
        : pacientesPeriodo.filter(p => p.macrorregiao === macro);

      const totalCases = lista.length;

      // STEMI = SCACESST
      const stemiCases = lista.filter(p => p.triagem_medica?.tipo_sca === "SCACESST").length;

      // SCASESST (com ou sem troponina)
      const scasesstCases = lista.filter(p =>
        p.triagem_medica?.tipo_sca === "SCASESST_COM_TROPONINA" ||
        p.triagem_medica?.tipo_sca === "SCASESST_SEM_TROPONINA"
      ).length;

      // 1. Porta-ECG (≤10min)
      const portaEcg = calcMetric(lista.map(p =>
        diffMin(p.triagem_enfermagem?.data_hora_ecg, p.triagem_enfermagem?.data_hora_classificacao_risco)
      ), 10);

      // 2. Porta Decisão (≤20min) — início triagem até etapa 4
      const portaDecisao = calcMetric(lista.map(p => {
        const etapa4 = p.historico_etapas?.find(e => e.etapa === 4);
        if (!etapa4?.data_hora || !p.data_hora_inicio_triagem) return null;
        return diffMin(etapa4.data_hora, p.data_hora_inicio_triagem);
      }), 20);

      // 3. Regulação (≤15min)
      const regulacao = calcMetric(lista.map(p => {
        const etapa4 = p.historico_etapas?.find(e => e.etapa === 4);
        if (!etapa4?.data_hora || !p.regulacao_central?.data_hora) return null;
        return diffMin(p.regulacao_central.data_hora, etapa4.data_hora);
      }), 15);

      // 4. Porta-Telecardio (≤15min)
      const portaTelecardio = calcMetric(lista.map(p => {
        const etapa4 = p.historico_etapas?.find(e => e.etapa === 4);
        if (!etapa4?.data_hora || !p.assessoria_cardiologia?.data_hora) return null;
        return diffMin(p.assessoria_cardiologia.data_hora, etapa4.data_hora);
      }), 15);

      // 5. Transporte (≤90min)
      const transporte = calcMetric(lista.map(p =>
        diffMin(p.transporte?.data_hora_chegada_destino, p.transporte?.data_hora_inicio)
      ), 90);

      // 6. ICP-Hemodinâmica (≤15min)
      const icpHemodinamica = calcMetric(lista.map(p =>
        diffMin(p.hemodinamica?.data_hora_inicio_procedimento, p.hemodinamica?.data_hora_chegada)
      ), 15);

      // 7. FMC-to-device (≤120min)
      const fmcToDevice = calcMetric(lista.map(p =>
        diffMin(p.hemodinamica?.data_hora_chegada, p.data_hora_inicio_triagem)
      ), 120);

      // Distribuição por classificação de risco
      const classificacaoRisco = {
        vermelha: lista.filter(p => p.triagem_enfermagem?.classificacao_risco === "vermelha").length,
        laranja: lista.filter(p => p.triagem_enfermagem?.classificacao_risco === "laranja").length,
        amarela: lista.filter(p => p.triagem_enfermagem?.classificacao_risco === "amarela").length,
        verde: lista.filter(p => p.triagem_enfermagem?.classificacao_risco === "verde").length,
      };

      // ICP por tipo
      const icpPorTipo = {
        imediata: lista.filter(p => p.hemodinamica?.tipo_icp === "imediata").length,
        ate_24h: lista.filter(p => p.hemodinamica?.tipo_icp === "ate_24h").length,
        ate_72h: lista.filter(p => p.hemodinamica?.tipo_icp === "ate_72h").length,
        total: lista.filter(p => p.hemodinamica?.tipo_icp).length,
      };

      return {
        macro_region: macro,
        reference_period: referencePeriod,
        total_cases: totalCases,
        stemi_cases: stemiCases,
        scasesst_cases: scasesstCases,
        quality_indicators: {
          porta_ecg: portaEcg,
          porta_decisao: portaDecisao,
          regulacao: regulacao,
          porta_telecardio: portaTelecardio,
          transporte: transporte,
          icp_hemodinamica: icpHemodinamica,
          fmc_to_device: fmcToDevice
        },
        risk_distribution: classificacaoRisco,
        icp_distribution: icpPorTipo
      };
    });

    // Garantir URL completa do endpoint
    const fullUrl = INGEST_URL.endsWith('/functions/ingestCardioPBIndicators')
      ? INGEST_URL
      : `${INGEST_URL.replace(/\/$/, '')}/functions/ingestCardioPBIndicators`;

    // Enviar para o IAMPBSAUDE — tentar x-api-key e Authorization: Bearer
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY,
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        source: "CardioPB",
        generated_at: new Date().toISOString(),
        generated_by: user.email,
        indicators: indicators
      })
    });

    const responseText = await response.text();
    let responseData;
    try { responseData = JSON.parse(responseText); } catch (_) { responseData = responseText; }

    return Response.json({
      success: response.ok,
      status: response.status,
      sent_to: fullUrl,
      reference_period: referencePeriod,
      macros_sent: indicators.length,
      total_cases_all: indicators.find(i => i.macro_region === "todas")?.total_cases || 0,
      response: responseData
    });

  } catch (error) {
    console.error("[ERRO]", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});