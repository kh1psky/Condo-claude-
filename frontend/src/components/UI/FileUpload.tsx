// frontend/src/components/UI/FileUpload.tsx
import React, { useCallback } from 'react';
import {
  Box,
  VStack,
  Text,
  Button,
  Progress,
  HStack,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { Upload, File, X } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  accept?: Record<string, string[]>;
  maxFiles?: number;
  maxSize?: number;
  multiple?: boolean;
  progress?: number;
  isUploading?: boolean;
  uploadedFiles?: Array<{ name: string; url: string }>;
  onRemoveFile?: (index: number) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  accept = {
    'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  },
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
  multiple = true,
  progress,
  isUploading = false,
  uploadedFiles = [],
  onRemoveFile,
}) => {
  const borderColor = useColorModeValue('gray.300', 'gray.600');
  const bgColor = useColorModeValue('gray.50', 'gray.700');

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFileSelect(acceptedFiles);
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    maxSize,
    multiple,
  });

  return (
    <VStack spacing={4} align="stretch">
      {/* Zona de drop */}
      <Box
        {...getRootProps()}
        p={8}
        border="2px dashed"
        borderColor={isDragActive ? 'brand.400' : borderColor}
        borderRadius="lg"
        bg={isDragActive ? 'brand.50' : bgColor}
        cursor="pointer"
        transition="all 0.2s"
        _hover={{
          borderColor: 'brand.400',
          bg: 'brand.50',
        }}
      >
        <input {...getInputProps()} />
        <VStack spacing={4}>
          <Icon
            as={Upload}
            w={12}
            h={12}
            color={isDragActive ? 'brand.500' : 'gray.400'}
          />
          <VStack spacing={2} textAlign="center">
            <Text fontWeight="semibold" color="gray.700">
              {isDragActive
                ? 'Solte os arquivos aqui'
                : 'Arraste arquivos ou clique para selecionar'}
            </Text>
            <Text fontSize="sm" color="gray.500">
              Máximo {maxFiles} arquivo(s), até {Math.round(maxSize / 1024 / 1024)}MB cada
            </Text>
          </VStack>
          <Button size="sm" variant="outline" colorScheme="brand">
            Selecionar Arquivos
          </Button>
        </VStack>
      </Box>

      {/* Erros de validação */}
      {fileRejections.length > 0 && (
        <VStack spacing={2} align="start">
          {fileRejections.map(({ file, errors }) => (
            <Box key={file.name} p={3} bg="red.50" borderRadius="md" w="full">
              <Text fontSize="sm" fontWeight="semibold" color="red.700">
                {file.name}
              </Text>
              {errors.map((error) => (
                <Text key={error.code} fontSize="xs" color="red.600">
                  {error.message}
                </Text>
              ))}
            </Box>
          ))}
        </VStack>
      )}

      {/* Progress de upload */}
      {isUploading && (
        <Box>
          <HStack justify="space-between" mb={2}>
            <Text fontSize="sm" fontWeight="medium">
              Enviando arquivos...
            </Text>
            <Text fontSize="sm" color="gray.500">
              {progress}%
            </Text>
          </HStack>
          <Progress value={progress} colorScheme="brand" borderRadius="full" />
        </Box>
      )}

      {/* Arquivos enviados */}
      {uploadedFiles.length > 0 && (
        <VStack spacing={2} align="stretch">
          <Text fontSize="sm" fontWeight="semibold" color="gray.700">
            Arquivos enviados:
          </Text>
          {uploadedFiles.map((file, index) => (
            <HStack
              key={index}
              p={3}
              bg="green.50"
              borderRadius="md"
              justify="space-between"
            >
              <HStack>
                <Icon as={File} w={4} h={4} color="green.600" />
                <Text fontSize="sm" color="green.700">
                  {file.name}
                </Text>
              </HStack>
              {onRemoveFile && (
                <Button
                  size="xs"
                  variant="ghost"
                  colorScheme="red"
                  onClick={() => onRemoveFile(index)}
                >
                  <X size={14} />
                </Button>
              )}
            </HStack>
          ))}
        </VStack>
      )}
    </VStack>
  );
};