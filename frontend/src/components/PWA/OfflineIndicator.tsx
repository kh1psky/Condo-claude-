// frontend/src/components/PWA/OfflineIndicator.tsx
import React from 'react';
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  Flex,
} from '@chakra-ui/react';
import { WifiOff } from 'lucide-react';
import { usePWA } from '../../hooks/usePWA';

export const OfflineIndicator: React.FC = () => {
  const { isOffline } = usePWA();

  if (!isOffline) return null;

  return (
    <Alert
      status="warning"
      variant="solid"
      position="fixed"
      top={0}
      left={0}
      right={0}
      zIndex="banner"
      borderRadius={0}
      py={2}
    >
      <Flex align="center" justify="center" w="full">
        <WifiOff size={20} />
        <Box ml={2}>
          <AlertTitle fontSize="sm">
            Sem conexão
          </AlertTitle>
          <AlertDescription fontSize="xs">
            Você está no modo offline. Algumas funcionalidades podem estar limitadas.
          </AlertDescription>
        </Box>
      </Flex>
    </Alert>
  );
};