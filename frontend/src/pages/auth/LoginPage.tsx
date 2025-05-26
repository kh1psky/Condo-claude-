// frontend/src/pages/auth/LoginPage.tsx
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
  Checkbox,
  Link,
  Alert,
  AlertIcon,
  useColorModeValue,
} from '@chakra-ui/react';
import { Building2, Mail, Lock } from 'lucide-react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    senha: '',
    lembrarMe: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Simular login (substituir por chamada real da API)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock de sucesso - redirecionar para dashboard
      navigate('/dashboard');
    } catch (err) {
      setError('Email ou senha incorretos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
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
              Sistema de Gerenciamento de Condomínios
            </Text>
          </VStack>

          {/* Card de Login */}
          <Card bg={cardBg} shadow="lg" borderRadius="xl" w="100%">
            <CardBody p={8}>
              <form onSubmit={handleSubmit}>
                <VStack spacing={6}>
                  <VStack spacing={1} w="100%">
                    <Heading size="md" textAlign="center">
                      Entrar na sua conta
                    </Heading>
                    <Text color="gray.500" textAlign="center">
                      Digite seus dados para acessar o sistema
                    </Text>
                  </VStack>

                  {error && (
                    <Alert status="error" borderRadius="md">
                      <AlertIcon />
                      {error}
                    </Alert>
                  )}

                  <VStack spacing={4} w="100%">
                    <Box position="relative" w="100%">
                      <Input
                        name="email"
                        type="email"
                        placeholder="Digite seu email"
                        value={formData.email}
                        onChange={handleChange}
                        pl={10}
                        h={12}
                        required
                      />
                      <Box position="absolute" left={3} top="50%" transform="translateY(-50%)">
                        <Mail size={16} color="gray" />
                      </Box>
                    </Box>

                    <Box position="relative" w="100%">
                      <Input
                        name="senha"
                        type="password"
                        placeholder="Digite sua senha"
                        value={formData.senha}
                        onChange={handleChange}
                        pl={10}
                        h={12}
                        required
                      />
                      <Box position="absolute" left={3} top="50%" transform="translateY(-50%)">
                        <Lock size={16} color="gray" />
                      </Box>
                    </Box>
                  </VStack>

                  <HStack justify="space-between" w="100%">
                    <Checkbox
                      name="lembrarMe"
                      isChecked={formData.lembrarMe}
                      onChange={handleChange}
                    >
                      Lembrar-me
                    </Checkbox>
                    <Link
                      as={RouterLink}
                      to="/forgot-password"
                      color="brand.500"
                      fontSize="sm"
                    >
                      Esqueci minha senha
                    </Link>
                  </HStack>

                  <Button
                    type="submit"
                    colorScheme="brand"
                    size="lg"
                    w="100%"
                    isLoading={isLoading}
                    loadingText="Entrando..."
                  >
                    Entrar
                  </Button>

                  <HStack spacing={1}>
                    <Text color="gray.500">Não tem uma conta?</Text>
                    <Link
                      as={RouterLink}
                      to="/register"
                      color="brand.500"
                      fontWeight="medium"
                    >
                      Criar conta
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
export default LoginPage;