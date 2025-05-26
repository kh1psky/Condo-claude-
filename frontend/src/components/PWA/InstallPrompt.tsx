// frontend/src/components/PWA/InstallPrompt.tsx
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
import { Download, X } from 'lucide-react';
import { usePWA } from '../../hooks/usePWA';

export const InstallPrompt: React.FC = () => {
  const { isInstallable, installApp, dismissInstallPrompt } = usePWA();
  const toast = useToast();

  if (!isInstallable) return null;

  const handleInstall = async () => {
    try {
      await installApp();
      toast({
        title: 'App instalado com sucesso!',
        description: 'Agora você pode acessar o GestCond diretamente da sua tela inicial.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Erro na instalação',
        description: 'Não foi possível instalar o app. Tente novamente.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Alert
      status="info"
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
            Instalar GestCond
          </AlertTitle>
          <AlertDescription>
            Adicione o app à sua tela inicial para acesso rápido e experiência completa offline.
          </AlertDescription>
        </Box>
      </Flex>
      
      <Flex gap={2} mt={{ base: 3, md: 0 }}>
        <Button
          leftIcon={<Download size={16} />}
          colorScheme="brand"
          size="sm"
          onClick={handleInstall}
        >
          Instalar
        </Button>
        <CloseButton onClick={dismissInstallPrompt} />
      </Flex>
    </Alert>
  );
}; 