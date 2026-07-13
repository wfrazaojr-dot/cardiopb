import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const { email, nome_completo, data_nascimento, cpf, telefone, perfil, funcao,
            registro_profissional_tipo, registro_profissional_numero,
            matricula, unidade_saude, equipe } = body;

    if (!email || !nome_completo || !perfil || !funcao) {
      return Response.json({ error: 'Campos obrigatórios: email, nome_completo, perfil, funcao' }, { status: 400 });
    }

    // ⚠️ POLÍTICA CRÍTICA: nome_completo vem do formulário, NUNCA do email
    // Exemplo: email "walberjp@gov.br" → nome_completo deve ser "Walber Alves Frazão Júnior" (digitado pelo usuário)
    // O prefixo do email "walberjp" é descartado completamente

    // Verificar se já existe solicitação pendente para este e-mail
    const existentes = await base44.asServiceRole.entities.SolicitacaoAcesso.filter({ email, status: "PENDENTE" });
    if (existentes && existentes.length > 0) {
      return Response.json({ success: true, ja_existe: true, message: 'Solicitação já registrada anteriormente.' });
    }

    // 1. CRIAR SolicitacaoAcesso com TODOS os dados EXATAMENTE como recebidos do formulário
    const solicitacao = await base44.asServiceRole.entities.SolicitacaoAcesso.create({
      email,
      nome_completo, // EXATAMENTE como o usuário digitou
      data_nascimento: data_nascimento || null,
      cpf: cpf || null,
      telefone: telefone || null,
      perfil,
      funcao,
      registro_profissional_tipo: registro_profissional_tipo || null,
      registro_profissional_numero: registro_profissional_numero || null,
      matricula: matricula || null,
      unidade_saude: unidade_saude || null,
      status: "PENDENTE",
    });

    // ✅ REGISTRAR AUDITORIA: Novo cadastro criado
    try {
      await base44.asServiceRole.functions.invoke("registrarLog", {
        acao: "criar",
        entidade: "SolicitacaoAcesso",
        entidade_id: solicitacao.id,
        descricao: `Nova solicitação de acesso criada para ${nome_completo} (${email})`,
        dados_novos: {
          email,
          nome_completo,
          data_nascimento,
          cpf,
          telefone,
          perfil,
          funcao,
          registro_profissional_tipo,
          registro_profissional_numero,
          matricula,
          unidade_saude,
        },
        severidade: "info"
      });
    } catch (auditError) {
      console.error(`[AUDITORIA] Falha ao registrar log: ${auditError.message}`);
    }

    // 2. ✅ GARANTIA CRÍTICA: SINCRONIZAR com User — apenas se o solicitante autenticado for dono do e-mail
    try {
      const currentUser = await base44.auth.me();
      if (currentUser && currentUser.email?.toLowerCase() === email.toLowerCase()) {
        const userFiltered = await base44.asServiceRole.entities.User.filter({ email: email.toLowerCase() });
        if (userFiltered && userFiltered.length > 0) {
          const existingUser = userFiltered[0];
          await base44.asServiceRole.entities.User.update(existingUser.id, {
            full_name: nome_completo.trim(),
            data_nascimento: data_nascimento || null,
            cpf: cpf?.trim() || null,
            telefone: telefone?.trim() || null,
            perfil: perfil,
            funcao: funcao,
            equipe: equipe || "unidade_saude",
            unidade_saude: unidade_saude?.trim() || null,
            registro_profissional_tipo: registro_profissional_tipo || null,
            registro_profissional_numero: registro_profissional_numero?.trim() || null,
            matricula: matricula?.trim() || null,
            status_acesso: "PENDENTE",
            cadastro_completo: true,
          });
        }
      }
    } catch (userError) {
      console.error(`[ERRO] Falha ao atualizar User: ${userError.message}`);
    }

    // Notificar administradores por e-mail
    const PERFIL_LABELS = {
      UNIDADE_SAUDE: "Unidade de Saúde", CERH: "CERH", ASSCARDIO: "ASSCARDIO",
      TRANSPORTE: "Transporte", HEMODINAMICA: "Hemodinâmica",
      ADMIN_TI_SECRETARIA: "Adm. TI Secretaria", ADMINISTRADOR_MASTER: "Adm. Master",
      ADMINISTRADOR_CERH: "Adm. CERH", ADMINISTRADOR_ASSCARDIO: "Adm. ASSCARDIO",
      GESTOR_DE_FARMACIA: "Gestor de Farmácia",
      DESENVOLVEDOR: "Adm. Desenvolvedor",
      ADMINISTRADOR_MANAGER: "Adm. Manager (legado)", ADMINISTRADOR_CARDIOLOGIA: "Adm. Cardiologia (legado)",
      ADMINISTRADOR_TRANSPORTE: "Adm. Transporte (legado)",
    };

    // Buscar admins para notificar
    const admins = await base44.asServiceRole.entities.User.filter({ status_acesso: "ATIVO" });
    const adminsParaNotificar = admins.filter(u =>
      u.role === "ADMIN_TI_SECRETARIA" || u.role === "ADMINISTRADOR_MANAGER" ||
      u.role === "admin" || u.email?.toLowerCase() === "wfrazaojr@gmail.com"
    );

    for (const admin of adminsParaNotificar) {
      const emailAdmin = admin.email_cadastro || admin.email;
      if (emailAdmin) {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: emailAdmin,
          subject: "🔔 Nova Solicitação de Acesso — Coração Paraibano",
          body: `Olá, ${admin.full_name || "Administrador"}!\n\nUma nova solicitação de acesso foi recebida:\n\nNome: ${nome_completo}\nE-mail: ${email}\nCPF: ${cpf || "não informado"}\nPerfil Solicitado: ${PERFIL_LABELS[perfil] || perfil}\nFunção: ${funcao}\n\nAcesse o sistema para aprovar ou rejeitar:\nhttps://coracaoparaibano.base44.app/ControleAcessos\n\nAtenciosamente,\nSistema Coração Paraibano`,
        });
      }
    }

    return Response.json({ success: true, id: solicitacao.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});