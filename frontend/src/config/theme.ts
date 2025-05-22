// frontend/src/config/theme.ts
import { extendTheme } from '@chakra-ui/react';

const colors = {
  brand: {
    50: '#f9e6eb',
    100: '#efc5d1',
    200: '#e4a3b7',
    300: '#d8819e',
    400: '#cd5f84',
    500: '#c13e6a', // Vinho primário
    600: '#a32e57',
    700: '#851f44',
    800: '#671031',
    900: '#49001e',
  },
  accent: {
    gold: '#d4af37',
    cream: '#f5f5dc',
    charcoal: '#36454f',
  }
};

const fonts = {
  heading: "'Montserrat', sans-serif",
  body: "'Open Sans', sans-serif",
};

const components = {
  Button: {
    baseStyle: {
      fontWeight: 'semibold',
      borderRadius: 'lg',
      transition: 'all 0.2s',
    },
    variants: {
      solid: {
        bg: 'brand.600',
        color: 'white',
        _hover: {
          bg: 'brand.700',
          transform: 'translateY(-1px)',
          boxShadow: 'lg',
        },
        _active: {
          bg: 'brand.800',
          transform: 'translateY(0)',
        },
      },
      outline: {
        borderColor: 'brand.500',
        color: 'brand.500',
        _hover: {
          bg: 'brand.50',
          borderColor: 'brand.600',
          color: 'brand.600',
        },
      },
      ghost: {
        color: 'brand.500',
        _hover: {
          bg: 'brand.50',
          color: 'brand.600',
        },
      },
    },
    defaultProps: {
      variant: 'solid',
    },
  },
  Card: {
    baseStyle: {
      container: {
        borderRadius: 'xl',
        boxShadow: 'md',
        border: '1px solid',
        borderColor: 'gray.100',
        transition: 'all 0.2s',
        _hover: {
          boxShadow: 'lg',
          transform: 'translateY(-2px)',
        },
      },
    },
  },
  Input: {
    variants: {
      outline: {
        field: {
          borderColor: 'gray.300',
          _hover: {
            borderColor: 'brand.300',
          },
          _focus: {
            borderColor: 'brand.500',
            boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
          },
        },
      },
    },
    defaultProps: {
      variant: 'outline',
    },
  },
  Alert: {
    variants: {
      subtle: {
        container: {
          borderRadius: 'lg',
          border: '1px solid',
        },
      },
    },
  },
  Modal: {
    baseStyle: {
      dialog: {
        borderRadius: 'xl',
        boxShadow: '2xl',
      },
    },
  },
  Menu: {
    baseStyle: {
      list: {
        borderRadius: 'lg',
        border: '1px solid',
        borderColor: 'gray.200',
        boxShadow: 'lg',
      },
      item: {
        _hover: {
          bg: 'brand.50',
          color: 'brand.600',
        },
      },
    },
  },
};

const styles = {
  global: {
    body: {
      bg: 'gray.50',
      color: 'gray.800',
    },
    '*': {
      '&::-webkit-scrollbar': {
        width: '8px',
      },
      '&::-webkit-scrollbar-track': {
        bg: 'gray.100',
      },
      '&::-webkit-scrollbar-thumb': {
        bg: 'brand.300',
        borderRadius: 'full',
        '&:hover': {
          bg: 'brand.400',
        },
      },
    },
  },
};

const config = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

const theme = extendTheme({
  colors,
  fonts,
  components,
  styles,
  config,
});

export default theme;
