// frontend/src/pages/auth/RegisterPage.tsx
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
  Select,
  Link,
  Alert,
  AlertIcon,
  useColorModeValue,
} from '@chakra-ui/react';
import { Building2, User, Mail, Lock, Phone } from 'lucide-react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    telefone: '',
    tipo: 'morador' as 'admin' | 'sindico' | 'funcionario' | 'morador',
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

    // Validações básicas
    if (formData.senha !== formData.confirmarSenha) {
      setError('As senhas não coincidem');
      setIsLoading(false);
      return;
    }

    if (formData.senha.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      setIsLoading(false);
      return;
    }

    try {
      // Simular registro (substituir por chamada real da API)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock de sucesso - redirecionar para login
      navigate('/login');
    } catch (err) {
      setError('Erro ao criar conta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Box bg={bgColor} minH="100vh" display="flex" alignItems="center" py={8}>
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
              Criar nova conta
            </Text>
          </VStack>

          {/* Card de Registro */}
          <Card bg={cardBg} shadow="lg" borderRadius="xl" w="100%">
            <CardBody p={8}>
              <form onSubmit={handleSubmit}>
                <VStack spacing={6}>
                  <VStack spacing={1} w="100%">
                    <Heading size="md" textAlign="center">
                      Criar sua conta
                    </Heading>
                    <Text color="gray.500" textAlign="center">
                      Preencha os dados para criar sua conta
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
                        name="nome"
                        type="text"
                        placeholder="Digite seu nome completo"
                        value={formData.nome}
                        onChange={handleChange}
                        pl={10}
                        h={12}
                        required
                      />
                      <Box position="absolute" left={3} top="50%" transform="translateY(-50%)">
                        <User size={16} color="gray" />
                      </Box>
                    </Box>

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
                        name="telefone"
                        type="tel"
                        placeholder="Digite seu telefone"
                        value={formData.telefone}
                        onChange={handleChange}
                        pl={10}
                        h={12}
                      />
                      <Box position="absolute" left={3} top="50%" transform="translateY(-50%)">
                        <Phone size={16} color="gray" />
                      </Box>
                    </Box>

                    <Select
                      name="tipo"
                      value={formData.tipo}
                      onChange={handleChange}
                      h={12}
                    >
                      <option value="morador">Morador</option>
                      <option value="sindico">Síndico</option>
                      <option value="funcionario">Funcionário</option>
                      <option value="admin">Administrador</option>
                    </Select>

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

                    <Box position="relative" w="100%">
                      <Input
                        name="confirmarSenha"
                        type="password"
                        placeholder="Confirme sua senha"
                        value={formData.confirmarSenha}
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

                  <Button
                    type="submit"
                    colorScheme="brand"
                    size="lg"
                    w="100%"
                    isLoading={isLoading}
                    loadingText="Criando conta..."
                  >
                    Criar conta
                  </Button>

                  <HStack spacing={1}>
                    <Text color="gray.500">Já tem uma conta?</Text>
                    <Link
                      as={RouterLink}
                      to="/login"
                      color="brand.500"
                      fontWeight="medium"
                    >
                      Fazer login
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
export default RegisterPage;