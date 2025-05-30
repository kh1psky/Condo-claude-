// frontend/src/pages/auth/ForgotPasswordPage.tsx
import React, { useState } from 'react';
import {
  Box,
  Container,
  Card,
  CardBody,
  VStack,
  HStack,
  Heading,
  Text,
  Input,
  Button,
  Link,
  Alert,
  AlertIcon,
  useColorModeValue,
} from '@chakra-ui/react';
import { Building2, Mail, ArrowLeft } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      // Simular envio de email (substituir por chamada real da API)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage('Um email com instruções para redefinir sua senha foi enviado.');
    } catch (err) {
      setError('Erro ao enviar email. Verifique o endereço e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box bg={bgColor} minH="100vh" display="flex" alignItems="center">
      <Container maxW="md">
        <VStack spacing={8}>
          {/* Logo */}
          <VStack spacing={2}>
            <Box
              p={4}
              bg="brand.500"
              borderRadius="full"
              color="white"
            >
              <Building2 size={40} />
            </Box>
            <Heading size="lg" color="brand.600">
              GestCond
            </Heading>
            <Text color="gray.500" textAlign="center">
              Recuperar senha
            </Text>
          </VStack>

          {/* Card de Recuperação */}
          <Card bg={cardBg} shadow="lg" borderRadius="xl" w="100%">
            <CardBody p={8}>
              <form onSubmit={handleSubmit}>
                <VStack spacing={6}>
                  <VStack spacing={1} w="100%">
                    <Heading size="md" textAlign="center">
                      Esqueceu sua senha?
                    </Heading>
                    <Text color="gray.500" textAlign="center">
                      Digite seu email para receber instruções de recuperação
                    </Text>
                  </VStack>

                  {error && (
                    <Alert status="error" borderRadius="md">
                      <AlertIcon />
                      {error}
                    </Alert>
                  )}

                  {message && (
                    <Alert status="success" borderRadius="md">
                      <AlertIcon />
                      {message}
                    </Alert>
                  )}

                  <Box position="relative" w="100%">
                    <Input
                      type="email"
                      placeholder="Digite seu email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      pl={10}
                      h={12}
                      required
                    />
                    <Box position="absolute" left={3} top="50%" transform="translateY(-50%)">
                      <Mail size={16} color="gray" />
                    </Box>
                  </Box>

                  <Button
                    type="submit"
                    colorScheme="brand"
                    size="lg"
                    w="100%"
                    isLoading={isLoading}
                    loadingText="Enviando..."
                  >
                    Enviar instruções
                  </Button>

                  <HStack spacing={2}>
                    <ArrowLeft size={16} />
                    <Link
                      as={RouterLink}
                      to="/login"
                      color="brand.500"
                      fontWeight="medium"
                    >
                      Voltar para o login
                    </Link>
                  </HStack>
                </VStack>
              </form>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
};

// Export default é crucial para React.lazy()
export default ForgotPasswordPage;