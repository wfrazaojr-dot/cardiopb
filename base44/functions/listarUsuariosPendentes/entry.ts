import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ROLES_PERMITIDOS = ['admin', 'ADMIN_TI_SECRETARIA', 'ADMINISTRADOR_MANAGER', 'ADMINISTRADOR_MASTER', 'ADMINISTRADOR_CERH', 'ADMINISTRADOR_ASSCARDIO', 'ADMINISTRADOR_CARDIOLOGIA', 'ADMINISTRADOR_TRANSPORTE', 'DESENVOLVEDOR'];
    const isDev = user.email?.toLowerCase() === 'wfrazaojr@gmail.com';

    if (!isDev && !ROLES_PERMITIDOS.includes(user.role)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // ✅ POLÍTICA CRÍTICA: SEMPRE usar dados da SolicitacaoAcesso, NUNCA sobrescrever com dados do User
    // Se o formulário diz "Walber Alves Frazão Júnior", isso é VERDADE, não importa o que o User tem
    
    const allUsers = await base44.asServiceRole.entities.User.list();
    const solicAcessos = await base44.asServiceRole.entities.SolicitacaoAcesso.list();

    // Fusionar SolicitacaoAcesso com User (priorizando SEMPRE SolicitacaoAcesso)
    const EQUIPE_MAP = {
      UNIDADE_SAUDE: "unidade_saude", CERH: "cerh", ASSCARDIO: "asscardio",
      TRANSPORTE: "transporte", HEMODINAMICA: "hemodinamica",
      ADMIN_TI_SECRETARIA: "admin", ADMINISTRADOR_MASTER: "admin",
      ADMINISTRADOR_CERH: "cerh", ADMINISTRADOR_ASSCARDIO: "asscardio",
      ADMINISTRADOR_MANAGER: "admin", ADMINISTRADOR_CARDIOLOGIA: "asscardio",
      ADMINISTRADOR_TRANSPORTE: "transporte"
    };

    // 1️⃣ Usuários que têm SolicitacaoAcesso (prioritário)
    const usuariosComSolic = solicAcessos.map(solic => {
      const user = allUsers.find(u => u.email?.toLowerCase() === solic.email?.toLowerCase());
      return {
        id: user?.id, // ✅ OBRIGATÓRIO: Sempre usar ID do User para ativar/desativar/excluir
        solicitacao_id: solic.id, // Guardar ID da solicitação para contexto apenas
        email: solic.email,
        full_name: solic.nome_completo, // ✅ SEMPRE do formulário
        cpf: solic.cpf,
        telefone: solic.telefone,
        perfil: solic.perfil,
        funcao: solic.funcao,
        registro_profissional_tipo: solic.registro_profissional_tipo,
        registro_profissional_numero: solic.registro_profissional_numero,
        matricula: solic.matricula,
        unidade_saude: solic.unidade_saude,
        equipe: EQUIPE_MAP[solic.perfil] || "unidade_saude",
        status_acesso: user?.status_acesso || solic.status,
        created_date: user?.created_date || solic.created_date,
        motivo_bloqueio: user?.motivo_bloqueio,
        role: user?.role,
      };
    });

    // 2️⃣ Usuários SEM SolicitacaoAcesso (usuarios do sistema já existentes)
    const usuariosSemSolic = allUsers
      .filter(u => !solicAcessos.find(s => s.email?.toLowerCase() === u.email?.toLowerCase()))
      .map(u => ({
        ...u,
        equipe: u.equipe || "unidade_saude",
      }));

    // Combinar e retornar
    const todosPrioritizado = [...usuariosComSolic, ...usuariosSemSolic];

    return Response.json({
      solicPendentes: solicAcessos.filter(s => s.status === "PENDENTE") || [],
      todos: todosPrioritizado || [],
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});