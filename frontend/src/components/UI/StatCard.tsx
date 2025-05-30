// frontend/src/components/UI/StatCard.tsx
import React from 'react';
import {
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Flex,
  Icon,
  Box,
  useColorModeValue,
} from '@chakra-ui/react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  helpText?: string;
  colorScheme?: 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'brand';
}

const colorMap = {
  blue: { bg: 'blue.500', light: 'blue.50', gradient: 'linear(to-r, blue.400, blue.600)' },
  green: { bg: 'green.500', light: 'green.50', gradient: 'linear(to-r, green.400, green.600)' },
  orange: { bg: 'orange.500', light: 'orange.50', gradient: 'linear(to-r, orange.400, orange.600)' },
  red: { bg: 'red.500', light: 'red.50', gradient: 'linear(to-r, red.400, red.600)' },
  purple: { bg: 'purple.500', light: 'purple.50', gradient: 'linear(to-r, purple.400, purple.600)' },
  brand: { bg: 'brand.500', light: 'brand.50', gradient: 'linear(to-r, brand.400, brand.600)' },
};

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  change,
  helpText,
  colorScheme = 'brand',
}) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const colors = colorMap[colorScheme];

  return (
    <Card
      bg={cardBg}
      borderRadius="xl"
      shadow="md"
      border="1px"
      borderColor="gray.100"
      transition="all 0.2s"
      _hover={{
        shadow: 'lg',
        transform: 'translateY(-2px)',
      }}
      overflow="hidden"
      position="relative"
    >
      {/* Gradiente decorativo */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        h="4px"
        bgGradient={colors.gradient}
      />
      
      <CardBody p={6}>
        <Flex justify="space-between" align="start">
          <Stat>
            <StatLabel fontSize="sm" color="gray.600" fontWeight="medium" mb={2}>
              {label}
            </StatLabel>
            <StatNumber 
              fontSize="2xl" 
              fontWeight="bold" 
              color="gray.800"
              mb={1}
            >
              {value}
            </StatNumber>
            {change && (
              <StatHelpText mb={0}>
                <StatArrow type={change.type} />
                {change.value}%
              </StatHelpText>
            )}
            {helpText && (
              <StatHelpText fontSize="xs" color="gray.500" mt={1}>
                {helpText}
              </StatHelpText>
            )}
          </Stat>
          
          <Box
            p={3}
            bg={colors.light}
            borderRadius="lg"
            border="1px"
            borderColor={colors.bg}
            // Removido borderOpacity que não existe
          >
            <Icon as={icon} w={6} h={6} color={colors.bg} />
          </Box>
        </Flex>
      </CardBody>
    </Card>
  );
};