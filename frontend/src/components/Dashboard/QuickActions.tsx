// frontend/src/components/Dashboard/QuickActions.tsx
import React from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Heading,
  SimpleGrid,
  VStack,
  HStack,
  Text,
  Button,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  Plus,
  Building2,
  Home,
  DollarSign,
  Wrench,
  FileText,
  Users,
  Package,
  Bell,
  Zap,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  action: () => void;
}

export const QuickActions: React.FC = () => {
  const navigate = useNavigate();
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.600');

  const quickActions: QuickAction[] = [
    {
      id: 'new-condominio',
      title: 'Novo Condomínio',
      description: 'Cadastrar condomínio',
      icon: Building2,
      color: 'blue',
      action: () => navigate('/condominios/novo'),
    },
    {
      id: 'new-unidade',
      title: 'Nova Unidade',
      description: 'Cadastrar unidade',
      icon: Home,
      color: 'green',
      action: () => navigate('/unidades/nova'),
    },
    {
      id: 'register-payment',
      title: 'Registrar Pagamento',
      description: 'Novo pagamento',
      icon: DollarSign,
      color: 'green',
      action: () => navigate('/pagamentos/novo'),
    },
    {
      id: 'new-maintenance',
      title: 'Nova Manutenção',
      description: 'Agendar manutenção',
      icon: Wrench,
      color: 'orange',
      action: () => navigate('/manutencao/nova'),
    },
    {
      id: 'new-contract',
      title: 'Novo Contrato',
      description: 'Cadastrar contrato',
      icon: FileText,
      color: 'purple',
      action: () => navigate('/contratos/novo'),
    },
    {
      id: 'new-user',
      title: 'Novo Usuário',
      description: 'Cadastrar usuário',
      icon: Users,
      color: 'brand',
      action: () => navigate('/usuarios/novo'),
    },
    {
      id: 'manage-inventory',
      title: 'Gerenciar Estoque',
      description: 'Inventário',
      icon: Package,
      color: 'yellow',
      action: () => navigate('/inventario'),
    },
    {
      id: 'send-notification',
      title: 'Enviar Notificação',
      description: 'Nova notificação',
      icon: Bell,
      color: 'red',
      action: () => navigate('/notificacoes/nova'),
    },
  ];

  return (
    <Card bg={cardBg} borderRadius="xl" shadow="md" border="1px" borderColor={borderColor}>
      <CardHeader>
        <HStack>
          <Zap size={20} color="#3182CE" />
          <Heading size="md" color="gray.700">
            Ações Rápidas
          </Heading>
        </HStack>
      </CardHeader>

      <CardBody pt={0}>
        <SimpleGrid columns={2} spacing={3}>
          {quickActions.map((action) => (
            <Button
              key={action.id}
              variant="outline"
              h="auto"
              p={4}
              borderRadius="lg"
              borderColor={borderColor}
              _hover={{
                bg: `${action.color}.50`,
                borderColor: `${action.color}.200`,
                transform: 'translateY(-2px)',
              }}
              transition="all 0.2s"
              onClick={action.action}
            >
              <VStack spacing={2}>
                <Icon
                  as={action.icon}
                  w={6}
                  h={6}
                  color={`${action.color}.500`}
                />
                <VStack spacing={0}>
                  <Text
                    fontSize="sm"
                    fontWeight="medium"
                    textAlign="center"
                    lineHeight="short"
                  >
                    {action.title}
                  </Text>
                  <Text
                    fontSize="xs"
                    color="gray.500"
                    textAlign="center"
                  >
                    {action.description}
                  </Text>
                </VStack>
              </VStack>
            </Button>
          ))}
        </SimpleGrid>
      </CardBody>
    </Card>
  );
};