// frontend/src/components/UI/LoadingScreen.tsx
import React from 'react';
import {
  Box,
  Flex,
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react';
import { Building2 } from 'lucide-react';

// Definir keyframes usando CSS-in-JS (sem usar keyframes do Chakra)
const keyframesStyles = `
  @keyframes pulseRing {
    0% {
      transform: scale(0.33);
    }
    40%, 50% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      transform: scale(1.2);
    }
  }

  @keyframes pulseDot {
    0% {
      transform: scale(0.8);
    }
    50% {
      transform: scale(1.0);
    }
    100% {
      transform: scale(0.8);
    }
  }
`;

export const LoadingScreen: React.FC = () => {
  return (
    <>
      <style>{keyframesStyles}</style>
      <Flex
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="gray.50"
        align="center"
        justify="center"
        zIndex="overlay"
      >
        <VStack spacing={8}>
          {/* Logo animado */}
          <Box position="relative">
            {/* Anel pulsante */}
            <Box
              position="absolute"
              top="50%"
              left="50%"
              w="120px"
              h="120px"
              border="4px solid"
              borderColor="brand.200"
              borderRadius="full"
              transform="translate(-50%, -50%)"
              css={{
                animation: 'pulseRing 1.5s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite'
              }}
            />
            
            {/* Logo central */}
            <Flex
              align="center"
              justify="center"
              w="80px"
              h="80px"
              bg="brand.600"
              borderRadius="full"
              color="white"
              shadow="lg"
              css={{
                animation: 'pulseDot 1.5s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite'
              }}
            >
              <Building2 size={40} />
            </Flex>
          </Box>

          {/* Texto e spinner */}
          <VStack spacing={4}>
            <Text
              fontSize="2xl"
              fontWeight="bold"
              color="brand.700"
            >
              GestCond
            </Text>
            
            <Spinner
              thickness="4px"
              speed="0.65s"
              emptyColor="gray.200"
              color="brand.500"
              size="lg"
            />
            
            <Text color="gray.600" fontSize="lg">
              Carregando...
            </Text>
          </VStack>
        </VStack>
      </Flex>
    </>
  );
};