// frontend/src/components/UI/FormModal.tsx
import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { LucideIcon } from 'lucide-react';

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  onSubmit?: () => void;
  onCancel?: () => void;
  submitText?: string;
  cancelText?: string;
  isLoading?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | 'full';
  hideFooter?: boolean;
}

export const FormModal: React.FC<FormModalProps> = ({
  isOpen,
  onClose,
  title,
  icon: Icon,
  children,
  onSubmit,
  onCancel,
  submitText = 'Salvar',
  cancelText = 'Cancelar',
  isLoading = false,
  size = 'md',
  hideFooter = false,
}) => {
  const modalBg = useColorModeValue('white', 'gray.800');

  const handleCancel = () => {
    onCancel?.();
    onClose();
  };

  const handleSubmit = () => {
    onSubmit?.();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={size} isCentered>
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
      <ModalContent bg={modalBg} borderRadius="xl" shadow="xl">
        <ModalHeader
          borderBottom="1px"
          borderColor="gray.200"
          borderRadius="xl xl 0 0"
          bg="gray.50"
          py={4}
        >
          <VStack spacing={2} align="start">
            {Icon && (
              <Icon size={24} color="var(--chakra-colors-brand-500)" />
            )}
            {title}
          </VStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody py={6}>
          {children}
        </ModalBody>

        {!hideFooter && (
          <ModalFooter borderTop="1px" borderColor="gray.200" gap={3}>
            <Button
              variant="outline"
              onClick={handleCancel}
              isDisabled={isLoading}
            >
              {cancelText}
            </Button>
            <Button
              colorScheme="brand"
              onClick={handleSubmit}
              isLoading={isLoading}
              loadingText="Salvando..."
            >
              {submitText}
            </Button>
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  );
};
