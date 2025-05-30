// frontend/src/components/Dashboard/RecentActivities.tsx
import React from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Heading,
  VStack,
  HStack,
  Text,
  Badge,
  Avatar,
  Box,
  Button,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  Activity,
  Calendar,
  DollarSign,
  FileText,
  Wrench,
  ChevronRight,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

interface RecentActivitiesProps {
  activities: ActivityItem[];
}

const activityIcons = {
  manutencao: Wrench,
  pagamento: DollarSign,
  contrato: FileText,
  notificacao: Activity,
};

const activityColors = {
  manutencao: 'orange',
  pagamento: 'green',
  contrato: 'blue',
  notificacao: 'purple',
};

const statusColors = {
  concluida: 'green',
  pendente: 'orange',
  ativo: 'blue',
  cancelado: 'red',
  atrasado: 'red',
  pago: 'green',
};

export const RecentActivities: React.FC<RecentActivitiesProps> = ({
  activities,
}) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.600');

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: ptBR,
      });
    } catch {
      return 'Data inválida';
    }
  };

  return (
    <Card bg={cardBg} borderRadius="xl" shadow="md" border="1px" borderColor={borderColor}>
      <CardHeader>
        <HStack justify="space-between">
          <HStack>
            <Activity size={20} color="#3182CE" />
            <Heading size="md" color="gray.700">
              Atividades Recentes
            </Heading>
          </HStack>
          <Button variant="ghost" size="sm" rightIcon={<ChevronRight size={16} />}>
            Ver todas
          </Button>
        </HStack>
      </CardHeader>

      <CardBody pt={0}>
        <VStack spacing={4} align="stretch">
          {activities.length === 0 ? (
            <Box textAlign="center" py={8}>
              <Text color="gray.500">Nenhuma atividade recente</Text>
            </Box>
          ) : (
            activities.map((activity) => {
              const Icon = activityIcons[activity.tipo];
              const activityColor = activityColors[activity.tipo];
              const statusColor = statusColors[activity.status as keyof typeof statusColors] || 'gray';

              return (
                <Box
                  key={activity.id}
                  p={4}
                  borderRadius="lg"
                  border="1px"
                  borderColor={borderColor}
                  _hover={{ bg: 'gray.50', borderColor: `${activityColor}.200` }}
                  transition="all 0.2s"
                  cursor="pointer"
                >
                  <HStack spacing={4} align="start">
                    {/* Ícone */}
                    <Box
                      p={2}
                      bg={`${activityColor}.50`}
                      borderRadius="lg"
                      border="1px"
                      borderColor={`${activityColor}.200`}
                      flexShrink={0}
                    >
                      <Icon size={16} color={`var(--chakra-colors-${activityColor}-500)`} />
                    </Box>

                    {/* Conteúdo */}
                    <VStack align="start" spacing={1} flex={1} minW={0}>
                      <HStack justify="space-between" w="100%">
                        <Text fontWeight="medium" fontSize="sm" noOfLines={1}>
                          {activity.descricao}
                        </Text>
                        <Badge
                          colorScheme={statusColor}
                          variant="subtle"
                          fontSize="xs"
                          flexShrink={0}
                        >
                          {activity.status}
                        </Badge>
                      </HStack>

                      <HStack spacing={2}>
                        <Calendar size={12} color="gray" />
                        <Text fontSize="xs" color="gray.500">
                          {formatDate(activity.data)}
                        </Text>
                      </HStack>

                      {activity.usuario && (
                        <HStack spacing={2} mt={1}>
                          <Avatar
                            size="xs"
                            name={activity.usuario.nome}
                            src={activity.usuario.avatar}
                          />
                          <Text fontSize="xs" color="gray.500">
                            {activity.usuario.nome}
                          </Text>
                        </HStack>
                      )}
                    </VStack>
                  </HStack>
                </Box>
              );
            })
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};