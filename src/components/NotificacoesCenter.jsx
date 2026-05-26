import React, { useState, useEffect, useRef } from 'react';
import { X, Bell, AlertCircle, Pill } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';

// Perfis que recebem notificação de TROMBÓLISE EM ANDAMENTO
const PERFIS_TROMBOLISE = ['ASSCARDIO', 'ADMINISTRADOR_CERH', 'ADMINISTRADOR_CARDIOLOGIA', 'ADMINISTRADOR_MANAGER', 'admin'];
const EQUIPES_TROMBOLISE = ['asscardio', 'cerh', 'unidade_saude'];

export default function NotificacoesCenter() {
  const [notificacoes, setNotificacoes] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const isAsscardio = window.location.pathname.toLowerCase().includes('asscardio');
  const audioCtxRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  // Som de alerta usando Web Audio API
  const tocarSom = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = ctx;
      const tocar = (freq, start, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.4, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      };
      tocar(880, 0, 0.2);
      tocar(1100, 0.25, 0.2);
      tocar(880, 0.5, 0.2);
      tocar(1100, 0.75, 0.3);
    } catch (e) {
      console.warn('Áudio não disponível:', e);
    }
  };

  useEffect(() => {
    if (isAsscardio) return;
    const unsubscribe = base44.entities.Paciente.subscribe((event) => {
      if (event.type === 'create' || event.type === 'update') {
        verificarNotificacoes(event.data, event.type);
      }
    });
    return unsubscribe;
  }, [isAsscardio]);

  // Subscrição para RegistroTrombolise
  useEffect(() => {
    if (!user) return;

    const devReceberTrombolise =
      PERFIS_TROMBOLISE.includes(user.role) ||
      EQUIPES_TROMBOLISE.includes(user.equipe) ||
      user.email?.toLowerCase() === 'wfrazaojr@gmail.com';

    if (!devReceberTrombolise) return;

    const unsubscribe = base44.entities.RegistroTrombolise.subscribe((event) => {
      if (
        event.type === 'update' &&
        event.data?.status_trombolise === 'TROMBÓLISE EM ANDAMENTO'
      ) {
        const msg = `💊 TROMBÓLISE EM ANDAMENTO — ${event.data.paciente_nome} (${event.data.indicacao || ''}) — ${event.data.unidade_saude || ''}`;
        adicionarNotificacaoTrombolise(msg, event.data.id);
        tocarSom();
      }
    });

    return unsubscribe;
  }, [user]);

  const verificarNotificacoes = async (paciente, tipoEvento) => {
    try {
      const config = await base44.entities.ConfiguracaoNotificacoes.list();
      const configGlobal = config.find(c => !c.unidade_saude) || {};

      let devNotificar = false;
      let mensagem = '';
      let tipo = 'info';

      if (tipoEvento === 'create' && configGlobal.notificar_chegada_paciente) {
        devNotificar = true;
        mensagem = `Novo paciente chegou: ${paciente.nome_completo}`;
        tipo = 'info';
      }

      if (
        paciente.triagem_medica?.tipo_sca === 'SCACESST' &&
        configGlobal.notificar_iamecg
      ) {
        devNotificar = true;
        mensagem = `⚠️ IAM-ECG: ${paciente.nome_completo} - CRÍTICO!`;
        tipo = 'critical';
      }

      if (
        paciente.classificacao_prioridade === 'Vermelha' &&
        configGlobal.notificar_classificacao_vermelha
      ) {
        devNotificar = true;
        mensagem = `🔴 Prioridade Vermelha: ${paciente.nome_completo}`;
        tipo = 'critical';
      }

      if (
        paciente.avaliacao_clinica?.heart_score?.total >= 7 &&
        configGlobal.notificar_heart_score_alto
      ) {
        devNotificar = true;
        mensagem = `⚠️ HEART Score Alto: ${paciente.nome_completo} (${paciente.avaliacao_clinica.heart_score.total} pontos)`;
        tipo = 'warning';
      }

      if (devNotificar) {
        adicionarNotificacao(mensagem, tipo, paciente.id);
      }
    } catch (error) {
      console.error('Erro ao verificar notificações:', error);
    }
  };

  const adicionarNotificacao = (mensagem, tipo, pacienteId) => {
    const id = Date.now();
    const notificacao = { id, mensagem, tipo, pacienteId };
    setNotificacoes(prev => [notificacao, ...prev]);
    setTimeout(() => {
      setNotificacoes(prev => prev.filter(n => n.id !== id));
    }, 10000);
  };

  const adicionarNotificacaoTrombolise = (mensagem, registroId) => {
    const id = Date.now();
    const notificacao = { id, mensagem, tipo: 'trombolise', registroId };
    setNotificacoes(prev => [notificacao, ...prev]);
    // Manter por 20 segundos pois é urgente
    setTimeout(() => {
      setNotificacoes(prev => prev.filter(n => n.id !== id));
    }, 20000);
  };

  const removerNotificacao = (id) => {
    setNotificacoes(prev => prev.filter(n => n.id !== id));
  };

  const irParaPaciente = (pacienteId) => {
    navigate(`${createPageUrl('Historico')}?pacienteId=${pacienteId}`);
    removerNotificacao(pacienteId);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      {notificacoes.map(notif => (
        <div
          key={notif.id}
          className={`rounded-lg shadow-xl p-4 text-white flex items-start gap-3 cursor-pointer transition-all duration-300 animate-pulse-once ${
            notif.tipo === 'trombolise'
              ? 'bg-gradient-to-r from-red-700 to-red-500 border-2 border-yellow-300 shadow-yellow-400/30'
              : notif.tipo === 'critical'
              ? 'bg-red-600 hover:bg-red-700'
              : notif.tipo === 'warning'
              ? 'bg-yellow-600 hover:bg-yellow-700'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
          onClick={() => notif.tipo === 'trombolise' ? navigate(createPageUrl('Dashboard')) : irParaPaciente(notif.pacienteId)}
        >
          <div className="flex-shrink-0 mt-1">
            {notif.tipo === 'trombolise' ? (
              <Pill className="w-6 h-6 text-yellow-300" />
            ) : notif.tipo === 'critical' ? (
              <AlertCircle className="w-5 h-5" />
            ) : (
              <Bell className="w-5 h-5" />
            )}
          </div>
          <div className="flex-1">
            {notif.tipo === 'trombolise' && (
              <p className="text-xs font-bold text-yellow-300 uppercase tracking-wide mb-1">⚠️ Alerta de Trombólise</p>
            )}
            <p className="text-sm font-semibold">{notif.mensagem}</p>
            <p className="text-xs opacity-80 mt-1">
              {notif.tipo === 'trombolise' ? 'Clique para ver o Painel de Regulação' : 'Clique para detalhes do paciente'}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              removerNotificacao(notif.id);
            }}
            className="flex-shrink-0 hover:opacity-75 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}