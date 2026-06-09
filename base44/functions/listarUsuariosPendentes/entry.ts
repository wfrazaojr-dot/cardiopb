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

    // Buscar todos os usuários do app (inclui os que aceitaram convite)
    const todosUsuarios = await base44.asServiceRole.entities.User.list();

    // Filtrar apenas os pendentes: sem status_acesso definido como ATIVO, sem role admin/dev
    const pendentes = todosUsuarios.filter(u =>
      u.email?.toLowerCase() !== 'wfrazaojr@gmail.com' &&
      u.role !== 'admin' &&
      u.status_acesso !== 'ATIVO' &&
      u.status_acesso !== 'BLOQUEADO' &&
      u.status_acesso !== 'INATIVO'
    );

    return Response.json({ pendentes });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});