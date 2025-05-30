// frontend/src/components/UI/ConfirmDialog.tsx
import React from 'react';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
  Text,
  VStack,
  Icon,
  Box, // Adicionado Box no import
  useColorModeValue,
} from '@chakra-ui/react';
import { AlertTriangle, Trash2, Check, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'success';
  isLoading?: boolean;
}

const typeConfig = {
  danger: {
    icon: Trash2,
    colorScheme: 'red',
    iconColor: 'red.500',
    bgColor: 'red.50',
  },
  warning: {
    icon: AlertTriangle,
    colorScheme: 'orange',
    iconColor: 'orange.500',
    bgColor: 'orange.50',
  },
  success: {
    icon: Check,
    colorScheme: 'green',
    iconColor: 'green.500',
    bgColor: 'green.50',
  },
};

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'danger',
  isLoading = false,
}) => {
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const config = typeConfig[type];
  const modalBg = useColorModeValue('white', 'gray.800');

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
      isCentered
    >
      <AlertDialogOverlay bg="blackAlpha.600" backdropFilter="blur(4px)">
        <AlertDialogContent bg={modalBg} borderRadius="xl" shadow="xl" mx={4}>
          <AlertDialogHeader fontSize="lg" fontWeight="bold" pb={2}>
            <VStack spacing={3} align="center">
              <Box
                p={3}
                bg={config.bgColor}
                borderRadius="full"
                border="1px"
                borderColor={config.iconColor}
              >
                <Icon as={config.icon} w={6} h={6} color={config.iconColor} />
              </Box>
              <Text textAlign="center">{title}</Text>
            </VStack>
          </AlertDialogHeader>

          <AlertDialogBody textAlign="center" py={4}>
            <Text color="gray.600">{description}</Text>
          </AlertDialogBody>

          <AlertDialogFooter gap={3}>
            <Button ref={cancelRef} onClick={onClose} isDisabled={isLoading}>
              {cancelText}
            </Button>
            <Button
              colorScheme={config.colorScheme}
              onClick={onConfirm}
              isLoading={isLoading}
              loadingText="Processando..."
            >
              {confirmText}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};