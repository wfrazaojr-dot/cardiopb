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

    // Buscar TODOS os usuários com privilégio de admin (ignora RLS)
    const todosUsuarios = await base44.asServiceRole.entities.User.list();

    // Filtrar pendentes: qualquer usuário sem status ATIVO/BLOQUEADO/INATIVO, exceto dev e admin
    const pendentes = todosUsuarios.filter(u =>
      u.email?.toLowerCase() !== 'wfrazaojr@gmail.com' &&
      u.role !== 'admin' &&
      u.status_acesso !== 'ATIVO' &&
      u.status_acesso !== 'BLOQUEADO' &&
      u.status_acesso !== 'INATIVO'
    );

    const todos = todosUsuarios.filter(u =>
      u.email?.toLowerCase() !== 'wfrazaojr@gmail.com'
    );

    return Response.json({ pendentes, todos });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});