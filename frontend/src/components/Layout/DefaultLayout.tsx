// frontend/src/components/Layout/DefaultLayout.tsx
import React, { useState } from 'react';
import { Box, useDisclosure } from '@chakra-ui/react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { InstallPrompt } from '../PWA/InstallPrompt';
import { UpdatePrompt } from '../PWA/UpdatePrompt';
import { OfflineIndicator } from '../PWA/OfflineIndicator';

interface DefaultLayoutProps {
  children: React.ReactNode;
}

export const DefaultLayout: React.FC<DefaultLayoutProps> = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Indicadores PWA */}
      <OfflineIndicator />
      
      {/* Layout principal */}
      <Sidebar isOpen={isOpen} onClose={onClose} />
      
      <Box ml={{ base: 0, lg: '280px' }}>
        <Navbar onSidebarToggle={onOpen} />
        
        <Box p={6}>
          {/* Prompts PWA */}
          <InstallPrompt />
          <UpdatePrompt />
          
          {/* Conteúdo principal */}
          {children}
        </Box>
      </Box>
    </Box>
  );
};