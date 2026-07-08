import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { paciente_id, acao, motivo, detalhes_outros, parecer_novo, conduta_nova, equipe } = body;

    if (!paciente_id || !acao) {
      return Response.json({ error: 'paciente_id e acao sao obrigatorios' }, { status: 400 });
    }

    // Buscar paciente atual
    let paciente;
    try {
      paciente = await base44.asServiceRole.entities.Paciente.get(paciente_id);
    } catch (e) {
      return Response.json({ error: 'Paciente nao encontrado' }, { status: 404 });
    }
    if (!paciente) return Response.json({ error: 'Paciente nao encontrado' }, { status: 404 });

    if (acao === 'solicitar_reavaliacao') {
      // Unidade de saude solicita reavaliacao
      if (!motivo) return Response.json({ error: 'motivo e obrigatorio' }, { status: 400 });

      const statusAnterior = paciente.status || 'Aguardando Transporte';

      const solicitacao = {
        data_hora: new Date().toISOString(),
        medico_nome: user.full_name || user.email,
        medico_email: user.email,
        unidade_saude: paciente.unidade_saude,
        motivo: motivo,
        detalhes_outros: motivo === 'Outro' ? (detalhes_outros || '') : '',
        status: 'pendente',
        status_anterior: statusAnterior,
      };

      await base44.asServiceRole.entities.Paciente.update(paciente_id, {
        solicitacao_reavaliacao: solicitacao,
        status: 'Reavaliação de Conduta',
      });

      // Log de auditoria
      await base44.asServiceRole.entities.LogAuditoria.create({
        usuario_email: user.email,
        usuario_nome: user.full_name,
        acao: 'atualizar',
        entidade: 'Paciente',
        entidade_id: paciente_id,
        descricao: `Solicitacao de reavaliacao de conduta: ${motivo}`,
        severidade: 'aviso',
      });

      // Notificar CERH e ASSCARDIO por email
      try {
        const usuariosNotificar = await base44.asServiceRole.entities.User.filter({
          $or: [
            { equipe: 'cerh' },
            { equipe: 'asscardio' },
            { role: 'ADMINISTRADOR_CERH' },
            { role: 'ADMINISTRADOR_CARDIOLOGIA' },
          ]
        });

        for (const u of usuariosNotificar) {
          if (u.email) {
            await base44.asServiceRole.integrations.Core.SendEmail({
              to: u.email,
              subject: `CARDIOPB - Reavaliação de Conduta Solicitada: ${paciente.nome_completo}`,
              body: `
                <h3>Solicitação de Reavaliação de Conduta</h3>
                <p><strong>Paciente:</strong> ${paciente.nome_completo}</p>
                <p><strong>Unidade:</strong> ${paciente.unidade_saude || '—'}</p>
                <p><strong>Macrorregião:</strong> ${paciente.macrorregiao || '—'}</p>
                <p><strong>Solicitado por:</strong> ${user.full_name || user.email}</p>
                <p><strong>Motivo:</strong> ${motivo}</p>
                ${detalhes_outros ? `<p><strong>Detalhes:</strong> ${detalhes_outros}</p>` : ''}
                <p>Acesse o sistema para emitir o Parecer Retificado.</p>
              `,
            });
          }
        }
      } catch (e) {
        console.log('Erro ao notificar:', e.message);
      }

      return Response.json({ success: true, message: 'Solicitação enviada com sucesso' });
    }

    if (acao === 'emitir_parecer_retificado') {
      // CERH ou ASSCARDIO emite parecer retificado
      if (!equipe || !['cerh', 'asscardio'].includes(equipe)) {
        return Response.json({ error: 'equipe invalida' }, { status: 400 });
      }
      if (!parecer_novo || !conduta_nova) {
        return Response.json({ error: 'parecer_novo e conduta_nova sao obrigatorios' }, { status: 400 });
      }

      const parecerAnterior = equipe === 'asscardio'
        ? (paciente.assessoria_cardiologia?.parecer_cardiologista || '')
        : (paciente.regulacao_central?.conduta_final || '');

      const condutaAnterior = equipe === 'asscardio'
        ? (paciente.assessoria_cardiologia?.diagnostico_estrategia || '')
        : (paciente.regulacao_central?.conduta_final || '');

      const novaEntrada = {
        data_hora: new Date().toISOString(),
        usuario_nome: user.full_name || user.email,
        usuario_email: user.email,
        usuario_equipe: equipe,
        motivo_retificacao: paciente.solicitacao_reavaliacao?.motivo || 'Reavaliação solicitada',
        detalhes_outros: paciente.solicitacao_reavaliacao?.detalhes_outros || '',
        parecer_anterior: parecerAnterior,
        parecer_novo: parecer_novo,
        conduta_anterior: condutaAnterior,
        conduta_nova: conduta_nova,
      };

      const historicoAtualizado = [...(paciente.historico_pareceres || []), novaEntrada];

      const updateData = {
        historico_pareceres: historicoAtualizado,
        solicitacao_reavaliacao: {
          ...paciente.solicitacao_reavaliacao,
          status: 'atendida',
          atendido_por: user.full_name || user.email,
          atendido_em: new Date().toISOString(),
        },
      };

      // Atualizar campo correspondente
      if (equipe === 'asscardio') {
        updateData.assessoria_cardiologia = {
          ...paciente.assessoria_cardiologia,
          parecer_cardiologista: parecer_novo,
          data_hora: new Date().toISOString(),
        };
      } else {
        updateData.regulacao_central = {
          ...paciente.regulacao_central,
          conduta_final: conduta_nova,
          data_hora: new Date().toISOString(),
        };
      }

      // Restaurar status anterior
      updateData.status = paciente.solicitacao_reavaliacao?.status_anterior || 'Aguardando Transporte';

      await base44.asServiceRole.entities.Paciente.update(paciente_id, updateData);

      // Log de auditoria
      await base44.asServiceRole.entities.LogAuditoria.create({
        usuario_email: user.email,
        usuario_nome: user.full_name,
        acao: 'atualizar',
        entidade: 'Paciente',
        entidade_id: paciente_id,
        descricao: `Parecer retificado emitido por ${equipe.toUpperCase()}: ${conduta_nova}`,
        severidade: 'info',
      });

      // Notificar unidade de saude
      try {
        if (paciente.created_by) {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: paciente.created_by,
            subject: `CARDIOPB - Parecer Retificado Emitido: ${paciente.nome_completo}`,
            body: `
              <h3>Parecer Retificado Emitido</h3>
              <p><strong>Paciente:</strong> ${paciente.nome_completo}</p>
              <p><strong>Emitido por:</strong> ${user.full_name || user.email} (${equipe.toUpperCase()})</p>
              <p><strong>Novo Parecer:</strong> ${parecer_novo}</p>
              <p><strong>Nova Conduta:</strong> ${conduta_nova}</p>
              <p>Acesse o sistema para visualizar o parecer completo.</p>
            `,
          });
        }
      } catch (e) {
        console.log('Erro ao notificar unidade:', e.message);
      }

      return Response.json({ success: true, message: 'Parecer retificado emitido com sucesso' });
    }

    return Response.json({ error: 'Acao invalida' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});