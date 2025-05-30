// frontend/src/components/Dashboard/MetricCard.tsx
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

interface MetricCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'orange' | 'red' | 'purple';
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
}

const colorMap = {
  blue: { bg: 'blue.500', light: 'blue.50' },
  green: { bg: 'green.500', light: 'green.50' },
  orange: { bg: 'orange.500', light: 'orange.50' },
  red: { bg: 'red.500', light: 'red.50' },
  purple: { bg: 'purple.500', light: 'purple.50' },
};

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  color,
  trend,
  description,
}) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const colors = colorMap[color];

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
    >
      <CardBody p={6}>
        <Flex justify="space-between" align="start">
          <Stat>
            <StatLabel fontSize="sm" color="gray.600" fontWeight="medium">
              {title}
            </StatLabel>
            <StatNumber 
              fontSize="2xl" 
              fontWeight="bold" 
              color="gray.800"
            >
              {value}
            </StatNumber>
            {trend && (
              <StatHelpText mb={0}>
                <StatArrow type={trend.isPositive ? 'increase' : 'decrease'} />
                {trend.value}%
              </StatHelpText>
            )}
            {description && (
              <StatHelpText fontSize="xs" color="gray.500" mt={1}>
                {description}
              </StatHelpText>
            )}
          </Stat>
          
          <Box
            p={3}
            bg={colors.light}
            borderRadius="lg"
            border="1px"
            borderColor={colors.bg}
            // Removido borderOpacity que não existe no Chakra UI
          >
            <Icon as={icon} w={6} h={6} color={colors.bg} />
          </Box>
        </Flex>
      </CardBody>
    </Card>
  );
};