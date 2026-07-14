import React, { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Activity, Plus, History, BookOpen, FileText, Users, AlertCircle, TrendingUp, Shield, LogOut, Truck, ClipboardList, Pill, FlaskConical } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import NotificacoesCenter from "@/components/NotificacoesCenter";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  // Redirecionar para PainelInicial se não selecionou perfil na sessão atual
  useEffect(() => {
    if (!user) return;
    
    const perfilSelecionado = sessionStorage.getItem('perfil_selecionado_sessao');
    if (!perfilSelecionado && currentPageName !== "PainelInicial") {
      navigate(createPageUrl("PainelInicial"), { replace: true });
    }
  }, [user, currentPageName, navigate]);



  const isDev = user?.email?.toLowerCase() === "wfrazaojr@gmail.com";

  const getNavigationItems = () => {
    const role = user?.role;

    // Lista completa de todos os itens de menu
    const allItems = [
      { title: "Painel Inicial", url: createPageUrl("PainelInicial"), icon: Activity },
      { title: "Painel Assistencial", url: createPageUrl("Historico"), icon: History },
      { title: "Painel de Regulação", url: createPageUrl("Dashboard"), icon: Activity },
      { title: "Indicadores", url: createPageUrl("Indicadores"), icon: TrendingUp },
      { title: "Protocolos", url: createPageUrl("Protocolos"), icon: BookOpen },
      { title: "Estratégias e Condutas", url: createPageUrl("ProtocoloEstrategias"), icon: FileText },
      { title: "Manual", url: createPageUrl("Manual"), icon: FileText },
      { title: "Monitor Transportes", url: createPageUrl("MonitorTransportes"), icon: Truck },
      { title: "Trombólise", url: createPageUrl("GestaoTrombolise"), icon: Pill },
      { title: "Relatório Farmacêutico", url: createPageUrl("RelatorioFarmacia"), icon: FlaskConical },
      { title: "Logs de Auditoria", url: createPageUrl("LogsAuditoria"), icon: ClipboardList },
      { title: "Controle de Acessos", url: "/ControleAcessos", icon: Shield },
      { title: "Administração", url: createPageUrl("Administracao"), icon: Shield },
    ];

    // Filtra itens por lista de exclusão
    const filterExcluding = (exclusions) =>
      allItems.filter(item => !exclusions.includes(item.title));

    // 1. DESENVOLVEDOR, ADMIN_TI_SECRETARIA (ou e-mail dev): ACESSO PLENO com Relatório Farmacêutico
    if (isDev || role === 'DESENVOLVEDOR' || role === 'ADMIN_TI_SECRETARIA') {
      return allItems;
    }

    // 1b. admin, ADMINISTRADOR_MANAGER: ACESSO PLENO sem Relatório Farmacêutico
    if (role === 'admin' || role === 'ADMINISTRADOR_MANAGER') {
      return filterExcluding(["Relatório Farmacêutico"]);
    }

    // 2. ADMINISTRADOR_MASTER: TUDO exceto Relatório Farmacêutico
    if (role === 'ADMINISTRADOR_MASTER') {
      return filterExcluding(["Relatório Farmacêutico"]);
    }

    // 3. ADMINISTRADOR_CERH: TUDO exceto Controle de Acessos, Logs de Auditoria, Relatório Farmacêutico, Monitor Transportes
    if (role === 'ADMINISTRADOR_CERH') {
      return filterExcluding(["Controle de Acessos", "Logs de Auditoria", "Relatório Farmacêutico", "Monitor Transportes"]);
    }

    // 4. ADMINISTRADOR_ASSCARDIO (ou legado ADMINISTRADOR_CARDIOLOGIA): mesmas exceções do CERH
    if (role === 'ADMINISTRADOR_ASSCARDIO' || role === 'ADMINISTRADOR_CARDIOLOGIA') {
      return filterExcluding(["Controle de Acessos", "Logs de Auditoria", "Relatório Farmacêutico", "Monitor Transportes"]);
    }

    // 5. GESTOR_DE_FARMACIA: apenas Painel Inicial + Relatório Farmacêutico
    if (role === 'GESTOR_DE_FARMACIA') {
      return [
        { title: "Painel Inicial", url: createPageUrl("PainelInicial"), icon: Activity },
        { title: "Relatório Farmacêutico", url: createPageUrl("RelatorioFarmacia"), icon: FlaskConical },
      ];
    }

    // 6. ADMINISTRADOR_TRANSPORTE (legado): Transporte + Regulação + Indicadores
    if (role === 'ADMINISTRADOR_TRANSPORTE') {
      return [
        { title: "Painel Inicial", url: createPageUrl("PainelInicial"), icon: Activity },
        { title: "Monitor Transportes", url: createPageUrl("MonitorTransportes"), icon: Truck },
        { title: "Painel de Regulação", url: createPageUrl("Dashboard"), icon: Activity },
        { title: "Indicadores", url: createPageUrl("Indicadores"), icon: TrendingUp },
      ];
    }

    // 7. ASSCARDIO operacional
    if (role === 'ASSCARDIO') {
      return [
        { title: "Painel Inicial", url: createPageUrl("PainelInicial"), icon: Activity },
        { title: "Painel de Regulação", url: createPageUrl("Dashboard"), icon: Activity },
        { title: "Protocolos", url: createPageUrl("Protocolos"), icon: BookOpen },
        { title: "Manual", url: createPageUrl("Manual"), icon: FileText },
        { title: "Estratégias e Condutas", url: createPageUrl("ProtocoloEstrategias"), icon: FileText },
        { title: "Formulário/Vaga", url: createPageUrl("FormularioVaga"), icon: FileText },
      ];
    }

    const equipe = user?.equipe || 'unidade_saude';

    // Menu para Transporte
    if (equipe === 'transporte') {
      return [
        { title: "Painel Inicial", url: createPageUrl("PainelInicial"), icon: Activity },
        { title: "Monitor Transportes", url: createPageUrl("MonitorTransportes"), icon: Truck },
        { title: "Painel de Regulação", url: createPageUrl("Dashboard"), icon: Activity },
      ];
    }

    // Menu para Unidades de Saúde
    if (equipe === 'unidade_saude') {
      return [
        { title: "Painel Inicial", url: createPageUrl("PainelInicial"), icon: Activity },
        { title: "Painel Assistencial", url: createPageUrl("Historico"), icon: History },
        { title: "Trombólise", url: createPageUrl("GestaoTrombolise"), icon: Pill },
        { title: "Protocolos", url: createPageUrl("Protocolos"), icon: BookOpen },
        { title: "Manual", url: createPageUrl("Manual"), icon: FileText },
        { title: "Estratégias e Condutas", url: createPageUrl("ProtocoloEstrategias"), icon: FileText },
        { title: "Formulário/Vaga", url: createPageUrl("FormularioVaga"), icon: FileText },
      ];
    }

    // Menu para CERH
    if (equipe === 'cerh') {
      return [
        { title: "Painel Inicial", url: createPageUrl("PainelInicial"), icon: Activity },
        { title: "Painel de Regulação", url: createPageUrl("Dashboard"), icon: Activity },
        { title: "Protocolos", url: createPageUrl("Protocolos"), icon: BookOpen },
        { title: "Manual", url: createPageUrl("Manual"), icon: FileText },
        { title: "Formulário/Vaga", url: createPageUrl("FormularioVaga"), icon: FileText },
      ];
    }

    // Menu para ASSCARDIO (via equipe)
    if (equipe === 'asscardio') {
      return [
        { title: "Painel Inicial", url: createPageUrl("PainelInicial"), icon: Activity },
        { title: "Painel de Regulação", url: createPageUrl("Dashboard"), icon: Activity },
        { title: "Protocolos", url: createPageUrl("Protocolos"), icon: BookOpen },
        { title: "Manual", url: createPageUrl("Manual"), icon: FileText },
        { title: "Formulário/Vaga", url: createPageUrl("FormularioVaga"), icon: FileText },
      ];
    }

    // Menu base para qualquer outro perfil
    return [{ title: "Painel Inicial", url: createPageUrl("PainelInicial"), icon: Activity }];
  };

  const navigationItems = getNavigationItems();

  const handleLogout = () => {
    if (confirm("Tem certeza que deseja sair do sistema?")) {
      sessionStorage.removeItem("profissional_logado");
      base44.auth.logout();
    }
  };

  return (
    <SidebarProvider defaultOpen={true} style={{ "--sidebar-width": "12rem" }}>
      <style>{`
        :root {
          --primary: 0 72% 51%;
          --primary-foreground: 0 0% 100%;
          --destructive: 0 84% 60%;
          --destructive-foreground: 0 0% 100%;
          }
        
        .ecg-background {
          background-image: url("data:image/svg+xml,%3Csvg width='100' height='60' viewBox='0 0 100 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 30 L 20 30 L 22 25 L 24 35 L 26 15 L 28 30 L 30 28 L 40 28 L 60 28 L 62 23 L 64 33 L 66 13 L 68 28 L 70 26 L 80 26 L 100 26' stroke='rgba(239, 68, 68, 0.08)' fill='none' stroke-width='1'/%3E%3C/svg%3E");
          background-repeat: repeat;
        }
      `}</style>
      <div className="min-h-screen flex flex-col w-full bg-gray-50 ecg-background">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-2 md:px-4 py-1.5 md:py-2 shadow-sm">
          <div className="grid grid-cols-3 items-center justify-items-center gap-1 md:gap-4 h-full w-full">
            {/* Logo Secretaria de Estado da Saúde - Esquerda */}
            <div>
              <img 
                src="https://media.base44.com/images/public/68fa0edee56f5a67f929da76/0e16b728d_logoSecretariadeEstadodaSade.png" 
                alt="Secretaria de Estado da Saúde" 
                className="h-10 max-w-[5rem] md:h-[6.6rem] md:max-w-[10rem] object-contain"
              />
            </div>

            {/* Logo CARDIOPB - Centro */}
            <div>
              <img 
                src="https://media.base44.com/images/public/68fa0edee56f5a67f929da76/d2078127c_LOGOCARDIOPB.jpg" 
                alt="CARDIOPB" 
                className="h-10 max-w-[5rem] md:h-[6.6rem] md:max-w-[10rem] object-contain"
              />
            </div>

            {/* Logo Complexo Regulador - Direita */}
            <div>
              <img 
                src="https://media.base44.com/images/public/68fa0edee56f5a67f929da76/940dd8bd1_LogoComplexoregulador.jpg" 
                alt="Complexo Regulador" 
                className="h-10 max-w-[5rem] md:h-[6.6rem] md:max-w-[10rem] object-contain"
              />
            </div>
          </div>
        </header>

        <div className="flex flex-1 min-h-0">
        <Sidebar className="border-r border-red-200 bg-white">
          <SidebarHeader className="border-b border-red-200 p-1.5 bg-white">
            <div className="flex items-center justify-center">
              <img 
                src="https://media.base44.com/images/public/68fa0edee56f5a67f929da76/d2078127c_LOGOCARDIOPB.jpg" 
                alt="CARDIOPB" 
                className="h-12 w-auto"
              />
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-0">
            <SidebarGroup className="p-1">
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`hover:bg-red-50 hover:text-red-700 transition-colors duration-200 rounded mb-1.5 ${
                          location.pathname === item.url ? 'bg-red-50 text-red-700 font-semibold' : ''
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-2 px-3 py-2 text-[12px] leading-tight">
                          <item.icon className="w-4 h-4 flex-shrink-0" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>



            {user && (
              <SidebarGroup className="p-1">
                <SidebarGroupContent>
                  <div className="space-y-1">
                    <div className="bg-blue-50 p-1 rounded text-center">
                      <p className="text-[10px] text-blue-900 font-semibold truncate">{user.full_name}</p>
                      {(isDev || user.role === 'DESENVOLVEDOR') && (
                        <p className="text-[9px] text-purple-700 font-bold">DEV</p>
                      )}
                    </div>
                    <Button
                      onClick={handleLogout}
                      variant="ghost"
                      className="w-full text-red-600 hover:bg-red-50 text-[10px] h-6 px-1"
                      size="sm"
                    >
                      <LogOut className="w-3 h-3 mr-1" />
                      Sair
                    </Button>
                  </div>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </SidebarContent>

          <SidebarFooter className="border-t border-red-200 p-1.5 bg-gray-50">
            <div className="text-center leading-tight">
              <p className="text-[9px] font-semibold text-gray-700">Walber A. Frazão Jr.</p>
              <p className="text-[8px] text-gray-500">COREN 110.238</p>
              <p className="text-[8px] text-gray-400">© 2025</p>
            </div>
          </SidebarFooter>
        </Sidebar>

          <main className="flex-1 flex flex-col">
            <header className="bg-white border-b border-gray-200 px-4 py-3 md:hidden shadow-sm">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-lg shadow-lg transition-all duration-200" />
                <h1 className="text-lg font-bold text-red-600">CARDIOPB</h1>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto overflow-x-hidden" style={{WebkitOverflowScrolling: 'touch'}}>
              {children}
            </div>
          </main>
        </div>
      </div>
      <NotificacoesCenter />
    </SidebarProvider>
  );
}