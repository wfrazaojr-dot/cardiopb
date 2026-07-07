import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'admin' && user.email?.toLowerCase() !== 'wfrazaojr@gmail.com') {
      return Response.json({ error: 'Forbidden — apenas administradores' }, { status: 403 });
    }

    // Buscar um usuário com status_acesso = ATIVO para testar
    const usuarios = await base44.asServiceRole.entities.User.filter({ status_acesso: "ATIVO" }, "-created_date", 1);
    
    if (!usuarios || usuarios.length === 0) {
      return Response.json({ error: 'Nenhum usuário ATIVO encontrado para teste' }, { status: 404 });
    }

    const usuarioParaDeleta = usuarios[0];
    console.log(`[TESTE] Tentando deletar usuário: ${usuarioParaDeleta.full_name} (${usuarioParaDeleta.email}) com ID ${usuarioParaDeleta.id}`);

    // Tentar deletar
    try {
      await base44.asServiceRole.entities.User.delete(usuarioParaDeleta.id);
      return Response.json({ success: true, message: `Usuário ${usuarioParaDeleta.full_name} deletado com sucesso` });
    } catch (deleteError) {
      console.error("[ERRO DELEÇÃO]", deleteError);
      return Response.json({ error: `Erro ao deletar: ${deleteError.message}`, details: deleteError }, { status: 500 });
    }
  } catch (error) {
    console.error("[ERRO GERAL]", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});