import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const isDev = user.email?.toLowerCase() === 'wfrazaojr@gmail.com';
    const rolesPermitidos = ['admin', 'ADMIN_TI_SECRETARIA', 'ADMINISTRADOR_MANAGER', 'DESENVOLVEDOR'];
    if (!isDev && !rolesPermitidos.includes(user.role)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();

    const nova = await base44.asServiceRole.entities.SolicitacaoAcesso.create(body);

    return Response.json({ success: true, id: nova.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});