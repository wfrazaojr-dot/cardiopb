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
      "final.teste@hotmail.com",
      "novo.teste@hotmail.com",
      "teste.desat@hotmail.com",
      "teste.pedro@hotmail.com",
      "teste.final@hotmail.com",
      "teste.ativacao@hotmail.com",
      "teste.walber@hotmail.com",
      "walberjp@hotmail.com",
      "teste.maria@gov.br",
      "joaozinho@gov.br",
      "roberto.carlos@gov.br",
      "walberjp@gov.br",
      "joao_teste@gov.br",
      "maria_silva@gov.br",
      "teste@example.com",
      "teste-funcao@example.com",
      "triagem.upas@gmail.com",
      "teste@exemplo.com"
    ];

    const resultados = [];

    // ✅ Deletar usuários ATIVO
    const todosUsuarios = await base44.asServiceRole.entities.User.list();
    const usuariosTeste = todosUsuarios.filter(u => emailsTeste.includes(u.email?.toLowerCase()));

    for (const usuario of usuariosTeste) {
      try {
        await base44.asServiceRole.entities.User.delete(usuario.id);
        resultados.push({ email: usuario.email, tipo: "User ATIVO", status: "✅ Deletado" });
        console.log(`[DELETADO USER] ${usuario.email}`);
      } catch (err) {
        resultados.push({ email: usuario.email, tipo: "User", status: `❌ ${err.message}` });
      }
    }

    // ✅ Deletar solicitações PENDENTE
    const todasSolicitacoes = await base44.asServiceRole.entities.SolicitacaoAcesso.list();
    const solicitacoesTeste = todasSolicitacoes.filter(s => emailsTeste.includes(s.email?.toLowerCase()));

    for (const sol of solicitacoesTeste) {
      try {
        await base44.asServiceRole.entities.SolicitacaoAcesso.delete(sol.id);
        resultados.push({ email: sol.email, tipo: "SolicitacaoAcesso", status: "✅ Deletado" });
        console.log(`[DELETADO SOLICITAÇÃO] ${sol.email}`);
      } catch (err) {
        resultados.push({ email: sol.email, tipo: "SolicitacaoAcesso", status: `❌ ${err.message}` });
      }
    }

    return Response.json({ 
      message: `${usuariosTeste.length} User(s) + ${solicitacoesTeste.length} Solicitação(ões) deletado(s)`,
      resultados 
    });
  } catch (error) {
    console.error("[ERRO]", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});