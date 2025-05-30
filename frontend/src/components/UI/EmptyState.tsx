// frontend/src/components/UI/EmptyState.tsx
import React from 'react';
import {
  VStack,
  Text,
  Button,
  Box,
  useColorModeValue,
} from '@chakra-ui/react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  const iconColor = useColorModeValue('gray.400', 'gray.500');
  
  return (
    <VStack spacing={6} py={12} textAlign="center">
      <Box
        p={6}
        bg="gray.50"
        borderRadius="full"
        border="2px dashed"
        borderColor="gray.200"
      >
        <Icon size={48} color={iconColor} />
      </Box>
      
      <VStack spacing={2}>
        <Text fontSize="lg" fontWeight="semibold" color="gray.700">
          {title}
        </Text>
        <Text fontSize="sm" color="gray.500" maxW="sm">
          {description}
        </Text>
      </VStack>
      
      {actionLabel && onAction && (
        <Button colorScheme="brand" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </VStack>
  );
};
