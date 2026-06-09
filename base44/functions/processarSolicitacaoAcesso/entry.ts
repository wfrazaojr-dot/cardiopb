import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const ROLES_PERMITIDOS = ['admin', 'ADMINISTRADOR_MANAGER', 'ADMINISTRADOR_CERH', 'ADMINISTRADOR_CARDIOLOGIA', 'ADMINISTRADOR_TRANSPORTE', 'DESENVOLVEDOR'];
const DEV_EMAIL = 'wfrazaojr@gmail.com';

const EQUIPE_MAP = {
  UNIDADE_SAUDE: "unidade_saude", CERH: "cerh", ASSCARDIO: "asscardio",
  TRANSPORTE: "transporte", HEMODINAMICA: "hemodinamica",
  ADMINISTRADOR_MANAGER: "admin", ADMINISTRADOR_CERH: "cerh",
  ADMINISTRADOR_CARDIOLOGIA: "asscardio", ADMINISTRADOR_TRANSPORTE: "transporte",
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isDev = user.email?.toLowerCase() === DEV_EMAIL;
    if (!isDev && !ROLES_PERMITIDOS.includes(user.role)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { solicitacaoId, solicitacaoTipo, acao, userId, status, motivo } = body;

    // ── Ação sobre SolicitacaoAcesso externa (tipo = "solicitacao") ──
    if (solicitacaoId && acao && solicitacaoTipo === 'solicitacao') {
      if (acao === 'rejeitar') {
        await base44.asServiceRole.entities.SolicitacaoAcesso.delete(solicitacaoId);
        return Response.json({ success: true });
      }

      if (acao === 'aprovar') {
        const solicitacoes = await base44.asServiceRole.entities.SolicitacaoAcesso.filter({ id: solicitacaoId });
        const sol = solicitacoes?.[0];
        if (!sol) return Response.json({ error: 'Solicitação não encontrada' }, { status: 404 });

        const todosUsuarios = await base44.asServiceRole.entities.User.list();
        const usuarioExistente = todosUsuarios.find(u => u.email?.toLowerCase() === sol.email?.toLowerCase());

        if (usuarioExistente) {
          await base44.asServiceRole.entities.User.update(usuarioExistente.id, {
            nome_completo: sol.nome_completo,
            cpf: sol.cpf,
            telefone: sol.telefone,
            perfil: sol.perfil,
            funcao: sol.funcao,
            equipe: EQUIPE_MAP[sol.perfil] || "unidade_saude",
            registro_profissional_tipo: sol.registro_profissional_tipo,
            registro_profissional_numero: sol.registro_profissional_numero,
            matricula: sol.matricula,
            status_acesso: "ATIVO",
            cadastro_completo: true,
          });
        }

        await base44.asServiceRole.entities.SolicitacaoAcesso.update(solicitacaoId, { status: "APROVADO" });
        return Response.json({ success: true });
      }
    }

    // ── Ação sobre usuário GOV.BR pendente (tipo = "govbr") ──
    if (solicitacaoId && acao && solicitacaoTipo === 'govbr') {
      if (acao === 'rejeitar') {
        // Deletar o registro do User diretamente
        await base44.asServiceRole.entities.User.delete(solicitacaoId);
        return Response.json({ success: true });
      }
    }

    // ── Atualizar status de usuário existente (ativar/inativar/bloquear) ──
    if (userId && status) {
      const updateData = { status_acesso: status };
      if (motivo) updateData.motivo_bloqueio = motivo;
      if (status === "ATIVO") updateData.motivo_bloqueio = null;

      await base44.asServiceRole.entities.User.update(userId, {
       ...updateData,
       cadastro_completo: true
      });

      // Se aprovando, sincronizar SolicitacaoAcesso pendente do mesmo email
      if (status === "ATIVO") {
        const todosUsuarios = await base44.asServiceRole.entities.User.list();
        const usuarioAlvo = todosUsuarios.find(u => u.id === userId);
        if (usuarioAlvo?.email) {
          const solics = await base44.asServiceRole.entities.SolicitacaoAcesso.filter({ email: usuarioAlvo.email, status: "PENDENTE" });
          for (const sol of (solics || [])) {
            const dadosPerfil = {};
            if (!usuarioAlvo.perfil && sol.perfil)      dadosPerfil.perfil   = sol.perfil;
            if (!usuarioAlvo.funcao && sol.funcao)      dadosPerfil.funcao   = sol.funcao;
            if (!usuarioAlvo.equipe && sol.perfil)      dadosPerfil.equipe   = EQUIPE_MAP[sol.perfil] || "unidade_saude";
            if (!usuarioAlvo.cpf   && sol.cpf)          dadosPerfil.cpf      = sol.cpf;
            if (!usuarioAlvo.telefone && sol.telefone)  dadosPerfil.telefone = sol.telefone;
            if (Object.keys(dadosPerfil).length > 0) {
              await base44.asServiceRole.entities.User.update(userId, dadosPerfil);
            }
            await base44.asServiceRole.entities.SolicitacaoAcesso.update(sol.id, { status: "APROVADO" });
          }
        }
      }

      return Response.json({ success: true });
    }

    return Response.json({ error: 'Parâmetros inválidos' }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});