import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function GovBrCallback() {
  const [error, setError] = React.useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const processCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');

        if (!code) {
          setError('Código de autenticação não recebido. Acesso cancelado.');
          return;
        }

        // Validar state
        const savedState = sessionStorage.getItem('govbr_state');
        if (state !== savedState) {
          setError('Erro de segurança: state inválido.');
          return;
        }

        // Recuperar code_verifier
        const codeVerifier = sessionStorage.getItem('govbr_code_verifier');
        const email = sessionStorage.getItem('govbr_email');

        if (!codeVerifier || !email) {
          setError('Sessão expirada. Tente novamente.');
          return;
        }

        // Trocar code por tokens
        const response = await base44.functions.invoke('govbrAuth', {
          action: 'exchange-code',
          code,
          codeVerifier,
          state,
        });

        if (!response.data.success) {
          setError('Falha ao autenticar com GOV.BR. Tente novamente.');
          return;
        }

        const { cpf, name, email: govbrEmail } = response.data;

        // Encontrar ou criar o usuário
        const users = await base44.entities.User.filter({ email }, null, 1).catch(() => []);

        if (users && users.length > 0) {
          const user = users[0];

          // Atualizar dados do usuário com informações do GOV.BR se necessário
          if (user.status_acesso === 'ATIVO') {
            await base44.entities.User.update(user.id, {
              cpf: cpf || user.cpf,
              full_name: name || user.full_name,
            }).catch(err => console.warn('Aviso ao atualizar usuário:', err.message));

            // Limpar sessionStorage
            sessionStorage.removeItem('govbr_state');
            sessionStorage.removeItem('govbr_code_verifier');
            sessionStorage.removeItem('govbr_nonce');
            sessionStorage.removeItem('govbr_email');

            // Redirecionar para painel principal
            setTimeout(() => {
              window.location.href = '/';
            }, 1500);
          } else {
            setError('Sua conta não está ativa. Entre em contato com o administrador.');
          }
        } else {
          setError('Usuário não encontrado. Verifique seu cadastro.');
        }
      } catch (err) {
        console.error('Erro no callback GOV.BR:', err);
        setError(`Erro ao processar autenticação: ${err.message}`);
      }
    };

    processCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="pt-8 text-center space-y-4">
          {error ? (
            <>
              <Alert className="bg-red-50 border-red-200 text-red-800">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <button
                onClick={() => window.location.href = '/'}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Voltar para Login
              </button>
            </>
          ) : (
            <>
              <Loader2 className="w-12 h-12 animate-spin text-red-600 mx-auto" />
              <h2 className="text-lg font-semibold text-gray-900">
                Autenticando...
              </h2>
              <p className="text-sm text-gray-600">
                Processando sua autenticação com GOV.BR
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}