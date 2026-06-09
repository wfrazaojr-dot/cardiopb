import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const result1 = await base44.asServiceRole.entities.SolicitacaoAcesso.list('-created_date', 50);
    const result2 = await base44.asServiceRole.entities.SolicitacaoAcesso.filter({}, '-created_date', 50);

    return Response.json({ 
      list_count: result1?.length, 
      filter_count: result2?.length,
      list_data: result1,
      filter_data: result2,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});