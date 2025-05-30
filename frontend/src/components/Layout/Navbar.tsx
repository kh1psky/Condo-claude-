// frontend/src/components/Layout/Navbar.tsx
import React from 'react';
import {
  Box,
  Flex,
  IconButton,
  Heading,
  Spacer,
  HStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Badge,
  useColorModeValue,
  Text,
  Avatar,
  Button,
} from '@chakra-ui/react';
import {
  Menu as MenuIcon,
  Bell,
  Search,
  Settings,
  User,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  onSidebarToggle: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSidebarToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const bg = useColorModeValue('white', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box
      bg={bg}
      borderBottom="1px"
      borderColor={borderColor}
      px={4}
      py={3}
      position="sticky"
      top={0}
      zIndex="sticky"
      ml={{ base: 0, lg: '280px' }}
    >
      <Flex align="center">
        {/* Menu toggle para mobile */}
        <IconButton
          aria-label="Abrir menu"
          icon={<MenuIcon size={20} />}
          variant="ghost"
          onClick={onSidebarToggle}
          display={{ base: 'flex', lg: 'none' }}
          mr={2}
        />

        {/* Título da página */}
        <Heading size="md" color="gray.700">
          {getPageTitle(location.pathname)}
        </Heading>

        <Spacer />

        {/* Ações da navbar */}
        <HStack spacing={2}>
          {/* Botão de busca */}
          <IconButton
            aria-label="Buscar"
            icon={<Search size={20} />}
            variant="ghost"
            size="md"
          />

          {/* Notificações */}
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label="Notificações"
              icon={
                <Box position="relative">
                  <Bell size={20} />
                  <Badge
                    position="absolute"
                    top="-2px"
                    right="-2px"
                    colorScheme="red"
                    borderRadius="full"
                    minW="18px"
                    h="18px"
                    fontSize="10px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    3
                  </Badge>
                </Box>
              }
              variant="ghost"
              size="md"
            />
            <MenuList maxW="300px">
              <Box px={3} py={2} borderBottom="1px" borderColor={borderColor}>
                <Text fontWeight="semibold" fontSize="sm">
                  Notificações
                </Text>
              </Box>
              <MenuItem>
                <Box>
                  <Text fontSize="sm" fontWeight="medium">
                    Pagamento em atraso
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    Unidade 101 - Há 2 dias
                  </Text>
                </Box>
              </MenuItem>
              <MenuItem>
                <Box>
                  <Text fontSize="sm" fontWeight="medium">
                    Nova solicitação de manutenção
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    Elevador - Há 5 horas
                  </Text>
                </Box>
              </MenuItem>
              <MenuItem>
                <Box>
                  <Text fontSize="sm" fontWeight="medium">
                    Contrato vencendo
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    Limpeza - Em 15 dias
                  </Text>
                </Box>
              </MenuItem>
              <Box px={3} py={2} borderTop="1px" borderColor={borderColor}>
                <Button size="sm" variant="ghost" w="full">
                  Ver todas
                </Button>
              </Box>
            </MenuList>
          </Menu>

          {/* Menu do usuário */}
          <Menu>
            <MenuButton>
              <HStack spacing={2} cursor="pointer">
                <Avatar size="sm" name={user?.nome} bg="brand.500" color="white" />
                <Box textAlign="left" display={{ base: 'none', md: 'block' }}>
                  <Text fontSize="sm" fontWeight="medium">
                    {user?.nome}
                  </Text>
                  <Text fontSize="xs" color="gray.500" textTransform="capitalize">
                    {user?.tipo}
                  </Text>
                </Box>
              </HStack>
            </MenuButton>
            <MenuList>
              <MenuItem icon={<User size={16} />} onClick={() => navigate('/perfil')}>
                Meu Perfil
              </MenuItem>
              <MenuItem icon={<Settings size={16} />} onClick={() => navigate('/configuracoes')}>
                Configurações
              </MenuItem>
              <MenuItem icon={<LogOut size={16} />} onClick={handleLogout} color="red.500">
                Sair
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>
    </Box>
  );
};

// Função auxiliar para obter o título da página
function getPageTitle(pathname: string): string {
  const routes: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/condominios': 'Condomínios',
    '/unidades': 'Unidades',
    '/pagamentos': 'Pagamentos',
    '/manutencoes': 'Manutenções',
    '/inventario': 'Inventário',
    '/fornecedores': 'Fornecedores',
    '/contratos': 'Contratos',
    '/relatorios': 'Relatórios',
    '/notificacoes': 'Notificações',
    '/perfil': 'Meu Perfil',
    '/configuracoes': 'Configurações',
  };

  return routes[pathname] || 'GestCond';
}