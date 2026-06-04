import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Disparada automaticamente via Entity Automation quando
 * o campo status_acesso de um User muda para "ATIVO".
 * Envia e-mail de confirmação ao usuário notificando que o acesso foi liberado.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    const userData = payload.data;

    if (!userData) {
      return Response.json({ error: "Dados do usuário não encontrados no payload" }, { status: 400 });
    }

    const emailDestino = userData.email_cadastro || userData.email;
    const nomeUsuario = userData.nome_completo || userData.full_name || "Usuário";
    const perfilLabels = {
      UNIDADE_SAUDE: "Unidade de Saúde",
      CERH: "CERH",
      ASSCARDIO: "ASSCARDIO",
      TRANSPORTE: "Transporte",
      HEMODINAMICA: "Hemodinâmica",
      ADMINISTRADOR_MANAGER: "Administrador Manager",
      ADMINISTRADOR_CERH: "Administrador CERH",
      ADMINISTRADOR_CARDIOLOGIA: "Administrador Cardiologia",
      ADMINISTRADOR_TRANSPORTE: "Administrador Transporte",
    };
    const perfilLabel = perfilLabels[userData.perfil] || userData.perfil || "Não informado";

    if (!emailDestino) {
      return Response.json({ error: "E-mail do usuário não encontrado" }, { status: 400 });
    }

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: emailDestino,
      from_name: "Coração Paraibano - SES-PB",
      subject: "✅ Seu acesso ao Coração Paraibano foi aprovado!",
      body: `
Olá, ${nomeUsuario}!

Temos uma ótima notícia: seu cadastro no sistema Coração Paraibano foi <strong>aprovado</strong> pelo administrador responsável.

<strong>Detalhes do seu acesso:</strong>
• Perfil: ${perfilLabel}
• E-mail: ${emailDestino}

Você já pode acessar o sistema utilizando o botão "Entrar com GOV.BR":
👉 https://coracaoparaibano.base44.app

Caso encontre algum problema no acesso, entre em contato com o Administrador Manager da sua unidade.

Atenciosamente,
Equipe Coração Paraibano
Secretaria de Estado da Saúde da Paraíba

---
Este é um e-mail automático. Por favor, não responda a esta mensagem.
      `.trim(),
    });

    console.log(`E-mail de aprovação enviado para: ${emailDestino} (${nomeUsuario})`);
    return Response.json({ success: true, email_enviado: emailDestino });

  } catch (error) {
    console.error("Erro ao enviar e-mail de aprovação:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});