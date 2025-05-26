// frontend/src/pages/DashboardPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  GridItem,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Select,
  Card,
  CardBody,
  Flex,
  useColorModeValue,
  Spinner,
  Center,
} from '@chakra-ui/react';
import {
  Building2,
  Home,
  Users,
  DollarSign,
  AlertTriangle,
  Calendar,
  Package,
  TrendingUp,
  TrendingDown,
  Activity,
  RefreshCw,
  Download,
} from 'lucide-react';
import { MetricCard } from '../components/Dashboard/MetricCard';
import { ChartCard } from '../components/Dashboard/Chartcard';
import { RecentActivities } from '../components/Dashboard/RecentActivities';
import { QuickActions } from '../components/Dashboard/QuickActions';
import { PendingItems } from '../components/Dashboard/PendingItems';

// Tipos corrigidos para os dados
interface ActivityItem {
  id: number;
  tipo: 'manutencao' | 'pagamento' | 'contrato' | 'notificacao';
  descricao: string;
  data: string;
  status: string;
  usuario?: {
    nome: string;
    avatar?: string;
  };
}

interface ChartData {
  mes: string;
  receitas: number;
  despesas: number;
}

// Dados mock corrigidos
const mockDashboardData = {
  dadosBasicos: {
    totalCondominios: 12,
    totalUnidades: 240,
    totalUsuarios: 156,
    ocupacao: 85.5,
  },
  metricas: {
    receitaMensal: 125000,
    despesaMensal: 89000,
    inadimplencia: 8.2,
    manutencoesPendentes: 7,
    contratosPorVencer: 3,
    estoquesBaixo: 12,
  },
  estatisticas: [
    { mes: 'Jan', receita: 110000, despesa: 85000 },
    { mes: 'Fev', receita: 118000, despesa: 87000 },
    { mes: 'Mar', receita: 125000, despesa: 89000 },
    { mes: 'Abr', receita: 132000, despesa: 91000 },
    { mes: 'Mai', receita: 125000, despesa: 89000 },
    { mes: 'Jun', receita: 128000, despesa: 92000 },
  ],
  // Dados corrigidos para o ChartCard
  graficoReceitasDespesas: [
    { mes: 'Jan', receitas: 110000, despesas: 85000 },
    { mes: 'Fev', receitas: 118000, despesas: 87000 },
    { mes: 'Mar', receitas: 125000, despesas: 89000 },
    { mes: 'Abr', receitas: 132000, despesas: 91000 },
    { mes: 'Mai', receitas: 125000, despesas: 89000 },
    { mes: 'Jun', receitas: 128000, despesas: 92000 },
  ] as ChartData[],
  // Dados corrigidos para RecentActivities
  ultimasManutencoes: [
    {
      id: 1,
      tipo: 'manutencao' as const,
      descricao: 'Reparo no elevador - Bloco A',
      data: '2024-01-15',
      status: 'concluida',
      usuario: {
        nome: 'João Silva',
      }
    },
    {
      id: 2,
      tipo: 'pagamento' as const,
      descricao: 'Pagamento recebido - Apt 201',
      data: '2024-01-14',
      status: 'concluida',
      usuario: {
        nome: 'Maria Santos',
      }
    },
    {
      id: 3,
      tipo: 'contrato' as const,
      descricao: 'Novo contrato de limpeza assinado',
      data: '2024-01-13',
      status: 'ativo',
      usuario: {
        nome: 'Admin Sistema',
      }
    },
    {
      id: 4,
      tipo: 'manutencao' as const,
      descricao: 'Manutenção da piscina programada',
      data: '2024-01-12',
      status: 'pendente',
      usuario: {
        nome: 'Carlos Pereira',
      }
    },
  ] as ActivityItem[],
};

const DashboardPage: React.FC = () => {
  const [dashboardData, setDashboardData] = useState(mockDashboardData);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('30');

  const bgColor = useColorModeValue('gray.50', 'gray.900');

  // Simular carregamento de dados
  const handleRefresh = async () => {
    setIsLoading(true);
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
  };

  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPeriod(e.target.value);
    // Aqui você faria uma nova requisição para a API com o período selecionado
  };

  const handleExport = () => {
    // Implementar lógica de exportação
    console.log('Exportando relatório...');
  };

  if (isLoading) {
    return (
      <Center h="100vh" bg={bgColor}>
        <VStack spacing={4}>
          <Spinner size="xl" color="brand.500" thickness="4px" />
          <Text>Atualizando dashboard...</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Box bg={bgColor} minH="100vh" py={8}>
      <Container maxW="7xl">
        <VStack spacing={8} align="stretch">
          {/* Cabeçalho */}
          <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
            <VStack align="start" spacing={1}>
              <Heading size="lg" color="gray.800">
                Dashboard
              </Heading>
              <Text color="gray.600">
                Visão geral dos condomínios - Última atualização: há 5 minutos
              </Text>
            </VStack>

            <HStack spacing={3}>
              <Select
                value={selectedPeriod}
                onChange={handlePeriodChange}
                w="150px"
                bg="white"
              >
                <option value="7">Últimos 7 dias</option>
                <option value="30">Últimos 30 dias</option>
                <option value="90">Últimos 90 dias</option>
                <option value="365">Último ano</option>
              </Select>

              <Button
                leftIcon={<RefreshCw size={16} />}
                variant="outline"
                onClick={handleRefresh}
                isLoading={isLoading}
              >
                Atualizar
              </Button>

              <Button
                leftIcon={<Download size={16} />}
                colorScheme="brand"
                onClick={handleExport}
              >
                Exportar
              </Button>
            </HStack>
          </Flex>

          {/* Cards de Métricas Principais */}
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={6}>
            <GridItem>
              <MetricCard
                title="Total de Condomínios"
                value={dashboardData.dadosBasicos.totalCondominios.toString()}
                icon={Building2}
                color="blue"
                trend={{
                  value: 8.5,
                  isPositive: true,
                }}
                description="vs. mês anterior"
              />
            </GridItem>

            <GridItem>
              <MetricCard
                title="Total de Unidades"
                value={dashboardData.dadosBasicos.totalUnidades.toString()}
                icon={Home}
                color="green"
                trend={{
                  value: 3.2,
                  isPositive: true,
                }}
                description="vs. mês anterior"
              />
            </GridItem>

            <GridItem>
              <MetricCard
                title="Usuários Ativos"
                value={dashboardData.dadosBasicos.totalUsuarios.toString()}
                icon={Users}
                color="purple"
                trend={{
                  value: 12.8,
                  isPositive: true,
                }}
                description="vs. mês anterior"
              />
            </GridItem>

            <GridItem>
              <MetricCard
                title="Taxa de Ocupação"
                value={`${dashboardData.dadosBasicos.ocupacao}%`}
                icon={TrendingUp}
                color="orange"
                trend={{
                  value: 2.1,
                  isPositive: false,
                }}
                description="vs. mês anterior"
              />
            </GridItem>
          </Grid>

          {/* Cards de Métricas Financeiras */}
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={6}>
            <GridItem>
              <MetricCard
                title="Receita Mensal"
                value={`R$ ${(dashboardData.metricas.receitaMensal / 1000).toFixed(0)}k`}
                icon={DollarSign}
                color="green"
                trend={{
                  value: 15.3,
                  isPositive: true,
                }}
                description="vs. mês anterior"
              />
            </GridItem>

            <GridItem>
              <MetricCard
                title="Despesas Mensais"
                value={`R$ ${(dashboardData.metricas.despesaMensal / 1000).toFixed(0)}k`}
                icon={TrendingDown}
                color="red"
                trend={{
                  value: 5.7,
                  isPositive: false,
                }}
                description="vs. mês anterior"
              />
            </GridItem>

            <GridItem>
              <MetricCard
                title="Taxa de Inadimplência"
                value={`${dashboardData.metricas.inadimplencia}%`}
                icon={AlertTriangle}
                color="orange"
                trend={{
                  value: 1.2,
                  isPositive: false,
                }}
                description="vs. mês anterior"
              />
            </GridItem>
          </Grid>

          {/* Gráfico e Itens Pendentes */}
          <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
            <GridItem>
              <ChartCard
                title="Receitas vs Despesas"
                subtitle="Últimos 6 meses"
                data={dashboardData.graficoReceitasDespesas}
              />
            </GridItem>

            <GridItem>
              <PendingItems
                pendingPayments={dashboardData.metricas.manutencoesPendentes}
                expiringContracts={dashboardData.metricas.contratosPorVencer}
                lowStockItems={dashboardData.metricas.estoquesBaixo}
              />
            </GridItem>
          </Grid>

          {/* Atividades Recentes e Ações Rápidas */}
          <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
            <GridItem>
              <RecentActivities
                activities={dashboardData.ultimasManutencoes}
              />
            </GridItem>

            <GridItem>
              <QuickActions />
            </GridItem>
          </Grid>
        </VStack>
      </Container>
    </Box>
  );
};

// Export default é crucial para React.lazy()
export default DashboardPage;