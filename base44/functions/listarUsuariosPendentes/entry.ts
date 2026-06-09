import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rolesPermitidos = ['admin', 'ADMINISTRADOR_MANAGER', 'ADMINISTRADOR_CERH', 'ADMINISTRADOR_CARDIOLOGIA', 'ADMINISTRADOR_TRANSPORTE', 'DESENVOLVEDOR'];
    const isDev = user.email?.toLowerCase() === 'wfrazaojr@gmail.com';

    if (!isDev && !rolesPermitidos.includes(user.role)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Buscar TODOS os usuários e solicitações com privilégio de admin (ignora RLS)
    const [todosUsuarios, todasSolicitacoes] = await Promise.all([
      base44.asServiceRole.entities.User.list(),
      base44.asServiceRole.entities.SolicitacaoAcesso.list('-created_date', 200),
    ]);

    // Campos compactos para usuários (evitar payload gigante)
    const camposUser = (u) => ({
      id: u.id,
      email: u.email,
      full_name: u.full_name,
      role: u.role,
      status_acesso: u.status_acesso,
      cadastro_completo: u.cadastro_completo,
      nome_completo: u.nome_completo,
      cpf: u.cpf,
      telefone: u.telefone,
      perfil: u.perfil,
      funcao: u.funcao,
      equipe: u.equipe,
      registro_profissional_tipo: u.registro_profissional_tipo,
      registro_profissional_numero: u.registro_profissional_numero,
      matricula: u.matricula,
      unidade_saude: u.unidade_saude,
      motivo_bloqueio: u.motivo_bloqueio,
      email_cadastro: u.email_cadastro,
      created_date: u.created_date,
      updated_date: u.updated_date,
    });

    // Filtrar pendentes da entidade User — apenas quem completou o cadastro
    const pendentes = todosUsuarios
      .filter(u =>
        u.email?.toLowerCase() !== 'wfrazaojr@gmail.com' &&
        u.role !== 'admin' &&
        u.cadastro_completo === true &&
        u.status_acesso !== 'ATIVO' &&
        u.status_acesso !== 'BLOQUEADO' &&
        u.status_acesso !== 'INATIVO'
      )
      .map(camposUser);

    const todos = todosUsuarios
      .filter(u => u.email?.toLowerCase() !== 'wfrazaojr@gmail.com')
      .map(camposUser);

    // Solicitações pendentes (entidade SolicitacaoAcesso)
    const solicPendentes = todasSolicitacoes.filter(s => s.status === 'PENDENTE');

    return Response.json({ pendentes, todos, solicPendentes });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});