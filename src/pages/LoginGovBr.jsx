import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LoginGovBr() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const email = sessionStorage.getItem('govbr_email');

  useEffect(() => {
    if (!email) {
      navigate('/');
    }
  }, [email, navigate]);

  const handleGovBrLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      // Gerar URL de autorização do GOV.BR
      const response = await base44.functions.invoke('govbrAuth', {
        action: 'generate-auth-url',
      });

      if (!response.data.authUrl) {
        throw new Error('Falha ao gerar URL de autorização');
      }

      // Armazenar state e codeVerifier na sessionStorage para validar no callback
      sessionStorage.setItem('govbr_state', response.data.state);
      sessionStorage.setItem('govbr_code_verifier', response.data.codeVerifier);
      sessionStorage.setItem('govbr_nonce', response.data.nonce);

      // Redirecionar para GOV.BR
      window.location.href = response.data.authUrl;
    } catch (err) {
      console.error('Erro ao gerar URL GOV.BR:', err);
      setError('Erro ao conectar com GOV.BR. Tente novamente.');
      setLoading(false);
    }
  };

  if (!email) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="bg-red-600 text-white">
          <div className="flex items-center gap-3 mb-4">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68fa0edee56f5a67f929da76/fa5f3a17e_LOGOCORAAOPARAIBANO.png" 
              alt="Coração Paraibano" 
              className="h-10 w-auto"
            />
          </div>
          <CardTitle className="text-white">Autenticação Segura</CardTitle>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Entrar com GOV.BR
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              E-mail: <strong>{email}</strong>
            </p>
            <p className="text-sm text-gray-600">
              Use sua conta GOV.BR para acessar com segurança
            </p>
          </div>

          {error && (
            <Alert className="bg-red-50 border-red-200 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleGovBrLogin}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Redirecionando...
              </>
            ) : (
              'Continuar com GOV.BR'
            )}
          </Button>

          <div className="text-center">
            <button
              onClick={() => navigate('/')}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Usar outro e-mail
            </button>
          </div>

          <div className="text-center pt-4 border-t">
            <p className="text-xs text-gray-500">
              Você será redirecionado para o login único do GOV.BR
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}