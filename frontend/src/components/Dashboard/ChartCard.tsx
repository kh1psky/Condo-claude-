// frontend/src/components/Dashboard/ChartCard.tsx
import React from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  Box,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface ChartData {
  mes: string;
  receitas: number;
  despesas: number;
}

interface ChartCardProps {
  title: string;
  subtitle?: string;
  data: ChartData[];
}

export const ChartCard: React.FC<ChartCardProps> = ({ title, subtitle, data }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const gridColor = useColorModeValue('#f0f0f0', '#374151');

  const formatCurrency = (value: number) => {
    return `R$ ${(value / 1000).toFixed(0)}k`;
  };

  return (
    <Card
      bg={cardBg}
      borderRadius="xl"
      shadow="md"
      border="1px"
      borderColor="gray.100"
    >
      <CardHeader pb={2}>
        <Heading size="md" color="gray.700">{title}</Heading>
        {subtitle && (
          <Text fontSize="sm" color="gray.500">{subtitle}</Text>
        )}
      </CardHeader>
      
      <CardBody pt={2}>
        <Box h="300px">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis 
                dataKey="mes" 
                fontSize={12}
                tick={{ fill: '#9CA3AF' }}
              />
              <YAxis 
                tickFormatter={formatCurrency}
                fontSize={12}
                tick={{ fill: '#9CA3AF' }}
              />
              <Tooltip
                formatter={(value: number) => [
                  `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                ]}
                labelStyle={{ color: '#374151' }}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="receitas"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
                name="Receitas"
              />
              <Line
                type="monotone"
                dataKey="despesas"
                stroke="#EF4444"
                strokeWidth={3}
                dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#EF4444', strokeWidth: 2 }}
                name="Despesas"
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </CardBody>
    </Card>
  );
};