import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LoginEmail() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleContinue = async () => {
    if (!email) {
      setError('Por favor, insira seu e-mail');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Verificar se usuário existe e está ativo
      const response = await base44.functions.invoke('govbrAuth', {
        action: 'check-user',
        email,
      });

      if (response.data.exists && response.data.isActive) {
        // Usuário já cadastrado e ativado - ir para GOV.BR login
        sessionStorage.setItem('govbr_email', email);
        navigate('/govbr-login');
      } else if (response.data.exists && !response.data.isActive) {
        // Usuário existe mas não está ativado
        setError('Sua conta ainda não foi ativada. Entre em contato com o administrador.');
      } else {
        // Novo usuário - ir para cadastro
        sessionStorage.setItem('new_user_email', email);
        navigate('/SolicitarAcesso');
      }
    } catch (err) {
      console.error('Erro ao verificar usuário:', err);
      setError('Erro ao verificar usuário. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

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
          <CardTitle className="text-white">Coração Paraibano</CardTitle>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Bem-vindo de volta
            </h2>
            <p className="text-sm text-gray-600">
              Insira seu e-mail para continuar
            </p>
          </div>

          {error && (
            <Alert className="bg-red-50 border-red-200 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              E-mail
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="email"
                placeholder="seu.email@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleContinue()}
                className="pl-10"
                disabled={loading}
              />
            </div>
          </div>

          <Button
            onClick={handleContinue}
            disabled={loading || !email}
            className="w-full bg-red-600 hover:bg-red-700 text-white gap-2"
            size="lg"
          >
            {loading ? 'Verificando...' : 'Continuar'} <ArrowRight className="w-4 h-4" />
          </Button>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Seus dados são protegidos conforme a LGPD
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}