// frontend/src/components/PWA/UpdatePrompt.tsx
import React from 'react';
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  CloseButton,
  Flex,
  Box,
  useToast,
} from '@chakra-ui/react';
import { RefreshCw } from 'lucide-react';
import { usePWA } from '../../hooks/usePWA';

export const UpdatePrompt: React.FC = () => {
  const { hasUpdate, reloadApp } = usePWA();
  const toast = useToast();

  if (!hasUpdate) return null;

  const handleUpdate = () => {
    try {
      reloadApp();
      toast({
        title: 'Atualizando app...',
        description: 'O app será recarregado com a nova versão.',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Erro na atualização',
        description: 'Não foi possível atualizar. Recarregue a página manualmente.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Alert
      status="warning"
      variant="subtle"
      flexDirection={{ base: 'column', md: 'row' }}
      alignItems={{ base: 'flex-start', md: 'center' }}
      justifyContent="space-between"
      borderRadius="lg"
      p={4}
      mb={4}
    >
      <Flex align="center" flex="1">
        <AlertIcon />
        <Box ml={3}>
          <AlertTitle fontSize="lg" mb={1}>
            Nova versão disponível
          </AlertTitle>
          <AlertDescription>
            Uma nova versão do app está disponível. Atualize para ter acesso às últimas funcionalidades.
          </AlertDescription>
        </Box>
      </Flex>
      
      <Flex gap={2} mt={{ base: 3, md: 0 }}>
        <Button
          leftIcon={<RefreshCw size={16} />}
          colorScheme="orange"
          size="sm"
          onClick={handleUpdate}
        >
          Atualizar
        </Button>
      </Flex>
    </Alert>
  );
};