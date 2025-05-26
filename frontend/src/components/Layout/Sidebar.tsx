// frontend/src/components/Layout/Sidebar.tsx
import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Icon,
  Flex,
  Divider,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useColorModeValue,
  Badge,
} from '@chakra-ui/react';
import {
  Home,
  Building2,
  Users,
  CreditCard,
  Wrench,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  ChevronDown,
  Package,
  UserCheck,
  Bell,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
  badge?: number;
  adminOnly?: boolean;
  sindicoOnly?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: Home, href: '/dashboard' },
  { label: 'Condomínios', icon: Building2, href: '/condominios', adminOnly: true },
  { label: 'Unidades', icon: Users, href: '/unidades' },
  { label: 'Pagamentos', icon: CreditCard, href: '/pagamentos' },
  { label: 'Manutenções', icon: Wrench, href: '/manutencoes' },
  { label: 'Inventário', icon: Package, href: '/inventario', sindicoOnly: true },
  { label: 'Fornecedores', icon: UserCheck, href: '/fornecedores', sindicoOnly: true },
  { label: 'Contratos', icon: FileText, href: '/contratos', sindicoOnly: true },
  { label: 'Relatórios', icon: BarChart3, href: '/relatorios', sindicoOnly: true },
  { label: 'Notificações', icon: Bell, href: '/notificacoes', badge: 3 },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const bg = useColorModeValue('white', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleNavigation = (href: string) => {
    navigate(href);
    onClose();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredNavItems = navItems.filter(item => {
    if (item.adminOnly && user?.tipo !== 'admin') return false;
    if (item.sindicoOnly && !['admin', 'sindico'].includes(user?.tipo || '')) return false;
    return true;
  });

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <Box
          position="fixed"
          inset={0}
          bg="blackAlpha.600"
          zIndex="overlay"
          onClick={onClose}
          display={{ base: 'block', lg: 'none' }}
        />
      )}

      {/* Sidebar */}
      <Box
        position="fixed"
        left={0}
        top={0}
        h="100vh"
        w={{ base: 'full', lg: '280px' }}
        bg={bg}
        borderRight="1px"
        borderColor={borderColor}
        zIndex="sidebar"
        transform={{
          base: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          lg: 'translateX(0)',
        }}
        transition="transform 0.3s ease"
        overflowY="auto"
        css={{
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-track': {
            width: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'var(--chakra-colors-brand-300)',
            borderRadius: '24px',
          },
        }}
      >
        <VStack spacing={0} align="stretch" h="full">
          {/* Logo/Header */}
          <Box p={6} borderBottom="1px" borderColor={borderColor}>
            <Flex align="center" gap={3}>
              <Box
                w={10}
                h={10}
                bg="brand.600"
                borderRadius="lg"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="white"
                fontWeight="bold"
                fontSize="lg"
              >
                GC
              </Box>
              <Box>
                <Text fontSize="xl" fontWeight="bold" color="brand.700">
                  GestCond
                </Text>
                <Text fontSize="sm" color="gray.500">
                  Sistema de Gestão
                </Text>
              </Box>
            </Flex>
          </Box>

          {/* Navigation */}
          <Box flex="1" py={4}>
            <VStack spacing={1} align="stretch" px={4}>
              {filteredNavItems.map((item) => {
                const isActive = location.pathname.startsWith(item.href);
                
                return (
                  <Box
                    key={item.href}
                    as="button"
                    w="full"
                    px={4}
                    py={3}
                    borderRadius="lg"
                    bg={isActive ? 'brand.50' : 'transparent'}
                    color={isActive ? 'brand.700' : 'gray.700'}
                    _hover={{
                      bg: isActive ? 'brand.100' : 'gray.50',
                      color: isActive ? 'brand.800' : 'gray.900',
                    }}
                    transition="all 0.2s"
                    onClick={() => handleNavigation(item.href)}
                  >
                    <HStack spacing={3} w="full">
                      <Icon as={item.icon} size={20} />
                      <Text fontSize="sm" fontWeight="medium" flex="1" textAlign="left">
                        {item.label}
                      </Text>
                      {item.badge && (
                        <Badge
                          colorScheme="red"
                          size="sm"
                          borderRadius="full"
                          minW="20px"
                          h="20px"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </HStack>
                  </Box>
                );
              })}
            </VStack>
          </Box>

          {/* User Menu */}
          <Box px={4} pb={4}>
            <Divider mb={4} />
            <Menu>
              <MenuButton
                as={Box}
                w="full"
                px={4}
                py={3}
                borderRadius="lg"
                _hover={{ bg: 'gray.50' }}
                transition="all 0.2s"
                cursor="pointer"
              >
                <HStack spacing={3}>
                  <Avatar size="sm" name={user?.nome} bg="brand.500" color="white" />
                  <Box flex="1" textAlign="left">
                    <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                      {user?.nome}
                    </Text>
                    <Text fontSize="xs" color="gray.500" textTransform="capitalize">
                      {user?.tipo}
                    </Text>
                  </Box>
                  <Icon as={ChevronDown} size={16} color="gray.400" />
                </HStack>
              </MenuButton>
              <MenuList>
                <MenuItem icon={<Settings size={16} />} onClick={() => navigate('/perfil')}>
                  Meu Perfil
                </MenuItem>
                <MenuItem icon={<Settings size={16} />} onClick={() => navigate('/configuracoes')}>
                  Configurações
                </MenuItem>
                <MenuDivider />
                <MenuItem icon={<LogOut size={16} />} onClick={handleLogout} color="red.500">
                  Sair
                </MenuItem>
              </MenuList>
            </Menu>
          </Box>
        </VStack>
      </Box>
    </>
  );
};