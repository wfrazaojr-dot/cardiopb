import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'admin' && user.role !== 'DESENVOLVEDOR') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Emails de teste a deletar
    const emailsTeste = [
      "teste.maria@gov.br",
      "joaozinho@gov.br",
      "roberto.carlos@gov.br"
    ];

    // Buscar todos os usuários
    const todosUsuarios = await base44.asServiceRole.entities.User.list();
    const usuariosTeste = todosUsuarios.filter(u => emailsTeste.includes(u.email?.toLowerCase()));

    console.log(`[TESTE] Encontrados ${usuariosTeste.length} usuários de teste para deletar`);

    const resultados = [];
    for (const usuario of usuariosTeste) {
      try {
        await base44.asServiceRole.entities.User.delete(usuario.id);
        resultados.push({ email: usuario.email, status: "✅ Deletado" });
        console.log(`[DELETADO] ${usuario.full_name} (${usuario.email})`);
      } catch (err) {
        resultados.push({ email: usuario.email, status: `❌ Erro: ${err.message}` });
        console.error(`[ERRO] ${usuario.email}: ${err.message}`);
      }
    }

    return Response.json({ 
      message: `${usuariosTeste.length} usuário(s) de teste deletado(s)`,
      resultados 
    });
  } catch (error) {
    console.error("[ERRO GERAL]", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});