// frontend/src/components/UI/StatusBadge.tsx
import React from 'react';
import { Badge, BadgeProps } from '@chakra-ui/react';

interface StatusBadgeProps extends Omit<BadgeProps, 'colorScheme'> {
  status: 'active' | 'inactive' | 'pending' | 'completed' | 'cancelled' | 'warning' | 'success' | 'error';
  children: React.ReactNode;
}

const statusConfig = {
  active: { colorScheme: 'green', label: 'Ativo' },
  inactive: { colorScheme: 'gray', label: 'Inativo' },
  pending: { colorScheme: 'orange', label: 'Pendente' },
  completed: { colorScheme: 'green', label: 'Concluído' },
  cancelled: { colorScheme: 'red', label: 'Cancelado' },
  warning: { colorScheme: 'orange', label: 'Atenção' },
  success: { colorScheme: 'green', label: 'Sucesso' },
  error: { colorScheme: 'red', label: 'Erro' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, children, ...props }) => {
  const config = statusConfig[status];
  
  return (
    <Badge
      colorScheme={config.colorScheme}
      borderRadius="full"
      px={3}
      py={1}
      fontSize="xs"
      fontWeight="semibold"
      textTransform="none"
      {...props}
    >
      {children}
    </Badge>
  );
};