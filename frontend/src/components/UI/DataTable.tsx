// frontend/src/components/UI/DataTable.tsx
import React, { useState } from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Card,
  CardBody,
  CardHeader,
  Heading,
  HStack,
  VStack,
  Button,
  Input,
  Select,
  Text,
  Badge,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Flex,
  Box,
  Skeleton,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';

export interface Column<T = Record<string, any>> {
  key: string;
  title: string;
  render?: (value: any, record: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface DataTableProps<T = Record<string, any>> {
  title?: string;
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  searchable?: boolean;
  filterable?: boolean;
  exportable?: boolean;
  selectable?: boolean;
  actions?: {
    view?: (record: T) => void;
    edit?: (record: T) => void;
    delete?: (record: T) => void;
    custom?: Array<{
      label: string;
      icon?: React.ElementType;
      onClick: (record: T) => void;
      color?: string;
    }>;
  };
  onSearch?: (value: string) => void;
  onFilter?: (filters: Record<string, any>) => void;
  onRefresh?: () => void;
  onExport?: () => void;
}

export function DataTable<T extends Record<string, any>>({
  title,
  columns,
  data,
  loading = false,
  pagination,
  searchable = true,
  filterable = false,
  exportable = false,
  selectable = false,
  actions,
  onSearch,
  onFilter,
  onRefresh,
  onExport,
}: DataTableProps<T>) {
  const [searchValue, setSearchValue] = useState('');
  const [selectedRows, setSelectedRows] = useState<Set<any>>(new Set());
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleSearch = (value: string) => {
    setSearchValue(value);
    onSearch?.(value);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(data.map(item => item.id || item)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (id: any, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedRows(newSelected);
  };

  const renderActions = (record: T) => {
    if (!actions) return null;

    const actionItems = [];

    if (actions.view) {
      actionItems.push(
        <MenuItem key="view" icon={<Eye size={16} />} onClick={() => actions.view!(record)}>
          Visualizar
        </MenuItem>
      );
    }

    if (actions.edit) {
      actionItems.push(
        <MenuItem key="edit" icon={<Edit size={16} />} onClick={() => actions.edit!(record)}>
          Editar
        </MenuItem>
      );
    }

    if (actions.delete) {
      actionItems.push(
        <MenuItem
          key="delete"
          icon={<Trash2 size={16} />}
          onClick={() => actions.delete!(record)}
          color="red.500"
        >
          Excluir
        </MenuItem>
      );
    }

    if (actions.custom) {
      actions.custom.forEach((action, index) => {
        actionItems.push(
          <MenuItem
            key={`custom-${index}`}
            icon={action.icon ? <action.icon size={16} /> : undefined}
            onClick={() => action.onClick(record)}
            color={action.color}
          >
            {action.label}
          </MenuItem>
        );
      });
    }

    return (
      <Menu>
        <MenuButton
          as={IconButton}
          icon={<MoreVertical size={16} />}
          variant="ghost"
          size="sm"
          aria-label="Ações"
        />
        <MenuList>
          {actionItems}
        </MenuList>
      </Menu>
    );
  };

  return (
    <Card bg={cardBg} borderRadius="xl" shadow="md" border="1px" borderColor={borderColor}>
      {/* Header */}
      {(title || searchable || filterable || exportable) && (
        <CardHeader>
          <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
            {title && (
              <Heading size="md" color="gray.700">
                {title}
              </Heading>
            )}
            
            <HStack spacing={3}>
              {searchable && (
                <Box position="relative">
                  <Input
                    placeholder="Buscar..."
                    value={searchValue}
                    onChange={(e) => handleSearch(e.target.value)}
                    pl={10}
                    w="250px"
                    bg="white"
                  />
                  <Box position="absolute" left={3} top="50%" transform="translateY(-50%)">
                    <Search size={16} color="gray" />
                  </Box>
                </Box>
              )}
              
              {filterable && (
                <IconButton
                  aria-label="Filtrar"
                  icon={<Filter size={16} />}
                  variant="outline"
                />
              )}
              
              {exportable && (
                <IconButton
                  aria-label="Exportar"
                  icon={<Download size={16} />}
                  variant="outline"
                  onClick={onExport}
                />
              )}
              
              {onRefresh && (
                <IconButton
                  aria-label="Atualizar"
                  icon={<RefreshCw size={16} />}
                  variant="outline"
                  onClick={onRefresh}
                  isLoading={loading}
                />
              )}
            </HStack>
          </Flex>
        </CardHeader>
      )}

      {/* Tabela */}
      <CardBody pt={title ? 0 : 6}>
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                {selectable && (
                  <Th w="50px">
                    <input
                      type="checkbox"
                      checked={selectedRows.size === data.length && data.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </Th>
                )}
                {columns.map((column) => (
                  <Th
                    key={column.key}
                    textAlign={column.align || 'left'}
                    width={column.width}
                  >
                    {column.title}
                  </Th>
                ))}
                {actions && <Th w="80px">Ações</Th>}
              </Tr>
            </Thead>
            <Tbody>
              {loading ? (
                // Skeleton loading
                Array.from({ length: 5 }).map((_, index) => (
                  <Tr key={index}>
                    {selectable && (
                      <Td>
                        <Skeleton h="20px" w="20px" />
                      </Td>
                    )}
                    {columns.map((column) => (
                      <Td key={column.key}>
                        <Skeleton h="20px" />
                      </Td>
                    ))}
                    {actions && (
                      <Td>
                        <Skeleton h="20px" w="30px" />
                      </Td>
                    )}
                  </Tr>
                ))
              ) : data.length === 0 ? (
                <Tr>
                  <Td
                    colSpan={
                      columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)
                    }
                    textAlign="center"
                    py={8}
                  >
                    <Text color="gray.500">Nenhum dado encontrado</Text>
                  </Td>
                </Tr>
              ) : (
                data.map((record, index) => {
                  const recordId = record.id || index;
                  return (
                    <Tr key={recordId} _hover={{ bg: 'gray.50' }}>
                      {selectable && (
                        <Td>
                          <input
                            type="checkbox"
                            checked={selectedRows.has(recordId)}
                            onChange={(e) => handleSelectRow(recordId, e.target.checked)}
                          />
                        </Td>
                      )}
                      {columns.map((column) => (
                        <Td key={column.key} textAlign={column.align || 'left'}>
                          {column.render
                            ? column.render(record[column.key] || '', record)
                            : record[column.key] || ''}
                        </Td>
                      ))}
                      {actions && <Td>{renderActions(record)}</Td>}
                    </Tr>
                  );
                })
              )}
            </Tbody>
          </Table>
        </Box>

        {/* Paginação */}
        {pagination && (
          <Flex justify="space-between" align="center" mt={4} pt={4} borderTop="1px" borderColor={borderColor}>
            <Text fontSize="sm" color="gray.600">
              Mostrando {((pagination.current - 1) * pagination.pageSize) + 1} até{' '}
              {Math.min(pagination.current * pagination.pageSize, pagination.total)} de{' '}
              {pagination.total} registros
            </Text>
            
            <HStack spacing={2}>
              <Button
                size="sm"
                variant="outline"
                leftIcon={<ChevronLeft size={16} />}
                isDisabled={pagination.current === 1}
                onClick={() => pagination.onChange(pagination.current - 1, pagination.pageSize)}
              >
                Anterior
              </Button>
              
              <Text fontSize="sm" color="gray.600">
                Página {pagination.current} de {Math.ceil(pagination.total / pagination.pageSize)}
              </Text>
              
              <Button
                size="sm"
                variant="outline"
                rightIcon={<ChevronRight size={16} />}
                isDisabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
                onClick={() => pagination.onChange(pagination.current + 1, pagination.pageSize)}
              >
                Próxima
              </Button>
            </HStack>
          </Flex>
        )}
      </CardBody>
    </Card>
  );
}