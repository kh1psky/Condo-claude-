// frontend/src/components/Dashboard/PendingItems.tsx
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
  Icon,
  Box,
  Button,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  AlertTriangle,
  CreditCard,
  FileText,
  Package,
  ArrowRight,
} from 'lucide-react';

interface PendingItemsProps {
  pendingPayments: number;
  expiringContracts: number;
  lowStockItems: number;
}

export const PendingItems: React.FC<PendingItemsProps> = ({
  pendingPayments,
  expiringContracts,
  lowStockItems,
}) => {
  const cardBg = useColorModeValue('white', 'gray.800');

  const items = [
    {
      title: 'Pagamentos Pendentes',
      count: pendingPayments,
      description: 'Valores em atraso este mês',
      icon: CreditCard,
      color: 'orange',
      action: 'Ver pagamentos',
    },
    {
      title: 'Contratos Vencendo',
      count: expiringContracts,
      description: 'Contratos vencem em 30 dias',
      icon: FileText,
      color: 'red',
      action: 'Ver contratos',
    },
    {
      title: 'Estoque Baixo',
      count: lowStockItems,
      description: 'Itens abaixo do mínimo',
      icon: Package,
      color: 'yellow',
      action: 'Ver inventário',
    },
  ];

  const colorMap = {
    orange: { bg: 'orange.500', light: 'orange.50' },
    red: { bg: 'red.500', light: 'red.50' },
    yellow: { bg: 'yellow.500', light: 'yellow.50' },
  };

  return (
    <Card
      bg={cardBg}
      borderRadius="xl"
      shadow="md"
      border="1px"
      borderColor="gray.100"
    >
      <CardHeader>
        <HStack>
          <AlertTriangle size={20} color="orange" />
          <Heading size="md" color="gray.700">Itens Pendentes</Heading>
        </HStack>
      </CardHeader>
      
      <CardBody pt={0}>
        <VStack spacing={4} align="stretch">
          {items.map((item, index) => {
            const colors = colorMap[item.color as keyof typeof colorMap];
            
            return (
              <Box
                key={index}
                p={4}
                borderRadius="lg"
                border="1px"
                borderColor="gray.100"
                _hover={{ 
                  bg: 'gray.50', 
                  borderColor: colors.bg,
                  // Removido borderOpacity que não existe
                }}
                transition="all 0.2s"
                cursor="pointer"
              >
                <HStack justify="space-between" align="center">
                  <HStack spacing={3}>
                    <Box
                      p={2}
                      bg={colors.light}
                      borderRadius="lg"
                      border="1px"
                      borderColor={colors.bg}
                      // Removido borderOpacity que não existe
                    >
                      <Icon as={item.icon} w={4} h={4} color={colors.bg} />
                    </Box>
                    
                    <VStack align="start" spacing={0}>
                      <HStack>
                        <Text fontWeight="semibold" fontSize="sm">
                          {item.title}
                        </Text>
                        <Badge
                          colorScheme={item.color}
                          borderRadius="full"
                          px={2}
                        >
                          {item.count}
                        </Badge>
                      </HStack>
                      <Text fontSize="xs" color="gray.500">
                        {item.description}
                      </Text>
                    </VStack>
                  </HStack>
                  
                  <Button
                    size="xs"
                    variant="ghost"
                    rightIcon={<ArrowRight size={12} />}
                    color={colors.bg}
                    _hover={{ bg: colors.light }}
                  >
                    {item.action}
                  </Button>
                </HStack>
              </Box>
            );
          })}
        </VStack>
      </CardBody>
    </Card>
  );
};