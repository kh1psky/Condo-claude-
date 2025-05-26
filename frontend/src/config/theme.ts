// frontend/src/config/theme.ts
import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

// Configuração do modo de cor
const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

// Cores personalizadas
const colors = {
  brand: {
    50: '#e6f3ff',
    100: '#b3d9ff',
    200: '#80bfff',
    300: '#4da6ff',
    400: '#1a8cff',
    500: '#0073e6',
    600: '#005bb3',
    700: '#004280',
    800: '#002a4d',
    900: '#00111a',
  },
  gray: {
    50: '#f7fafc',
    100: '#edf2f7',
    200: '#e2e8f0',
    300: '#cbd5e0',
    400: '#a0aec0',
    500: '#718096',
    600: '#4a5568',
    700: '#2d3748',
    800: '#1a202c',
    900: '#171923',
  },
};

// Fontes
const fonts = {
  heading: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

// Tamanhos de fonte
const fontSizes = {
  xs: '0.75rem',
  sm: '0.875rem',
  md: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
  '4xl': '2.25rem',
  '5xl': '3rem',
  '6xl': '3.75rem',
};

// Estilos globais
const styles = {
  global: (props: any) => ({
    body: {
      bg: props.colorMode === 'dark' ? 'gray.900' : 'gray.50',
      color: props.colorMode === 'dark' ? 'white' : 'gray.900',
    },
    '*::placeholder': {
      color: props.colorMode === 'dark' ? 'gray.400' : 'gray.500',
    },
    '*, *::before, &::after': {
      borderColor: props.colorMode === 'dark' ? 'gray.700' : 'gray.200',
    },
  }),
};

// Componentes personalizados
const components = {
  Button: {
    baseStyle: {
      fontWeight: 'semibold',
      borderRadius: 'lg',
    },
    sizes: {
      sm: {
        h: '32px',
        minW: '32px',
        fontSize: 'sm',
        px: 3,
      },
      md: {
        h: '40px',
        minW: '40px',
        fontSize: 'md',
        px: 4,
      },
      lg: {
        h: '48px',
        minW: '48px',
        fontSize: 'lg',
        px: 6,
      },
    },
    variants: {
      solid: (props: any) => ({
        bg: `${props.colorScheme}.500`,
        color: 'white',
        _hover: {
          bg: `${props.colorScheme}.600`,
          _disabled: {
            bg: `${props.colorScheme}.500`,
          },
        },
        _active: {
          bg: `${props.colorScheme}.700`,
        },
      }),
      outline: (props: any) => ({
        border: '2px solid',
        borderColor: `${props.colorScheme}.500`,
        color: `${props.colorScheme}.500`,
        _hover: {
          bg: `${props.colorScheme}.50`,
          _disabled: {
            bg: 'transparent',
          },
        },
        _active: {
          bg: `${props.colorScheme}.100`,
        },
      }),
      ghost: (props: any) => ({
        color: `${props.colorScheme}.500`,
        _hover: {
          bg: `${props.colorScheme}.50`,
          _disabled: {
            bg: 'transparent',
          },
        },
        _active: {
          bg: `${props.colorScheme}.100`,
        },
      }),
    },
    defaultProps: {
      colorScheme: 'brand',
    },
  },
  Card: {
    baseStyle: {
      container: {
        borderRadius: 'xl',
        boxShadow: 'sm',
        border: '1px solid',
        borderColor: 'gray.200',
        _dark: {
          borderColor: 'gray.700',
          bg: 'gray.800',
        },
      },
    },
  },
  Input: {
    baseStyle: {
      field: {
        borderRadius: 'lg',
        border: '2px solid',
        borderColor: 'gray.200',
        _focus: {
          borderColor: 'brand.500',
          boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
        },
        _dark: {
          borderColor: 'gray.600',
          _focus: {
            borderColor: 'brand.400',
            boxShadow: '0 0 0 1px var(--chakra-colors-brand-400)',
          },
        },
      },
    },
    sizes: {
      md: {
        field: {
          h: '40px',
          px: 4,
          fontSize: 'md',
        },
      },
      lg: {
        field: {
          h: '48px',
          px: 4,
          fontSize: 'lg',
        },
      },
    },
  },
  Select: {
    baseStyle: {
      field: {
        borderRadius: 'lg',
        border: '2px solid',
        borderColor: 'gray.200',
        _focus: {
          borderColor: 'brand.500',
          boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
        },
        _dark: {
          borderColor: 'gray.600',
          _focus: {
            borderColor: 'brand.400',
            boxShadow: '0 0 0 1px var(--chakra-colors-brand-400)',
          },
        },
      },
    },
  },
  Textarea: {
    baseStyle: {
      borderRadius: 'lg',
      border: '2px solid',
      borderColor: 'gray.200',
      _focus: {
        borderColor: 'brand.500',
        boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
      },
      _dark: {
        borderColor: 'gray.600',
        _focus: {
          borderColor: 'brand.400',
          boxShadow: '0 0 0 1px var(--chakra-colors-brand-400)',
        },
      },
    },
  },
  Badge: {
    baseStyle: {
      borderRadius: 'md',
      fontWeight: 'semibold',
      fontSize: 'xs',
      textTransform: 'none',
    },
  },
  Menu: {
    baseStyle: {
      list: {
        borderRadius: 'lg',
        border: '1px solid',
        borderColor: 'gray.200',
        boxShadow: 'lg',
        _dark: {
          borderColor: 'gray.700',
          bg: 'gray.800',
        },
      },
      item: {
        borderRadius: 'md',
        mx: 2,
        my: 1,
        _hover: {
          bg: 'brand.50',
          color: 'brand.700',
          _dark: {
            bg: 'brand.900',
            color: 'brand.200',
          },
        },
        _focus: {
          bg: 'brand.50',
          color: 'brand.700',
          _dark: {
            bg: 'brand.900',
            color: 'brand.200',
          },
        },
      },
    },
  },
  Modal: {
    baseStyle: {
      dialog: {
        borderRadius: 'xl',
        _dark: {
          bg: 'gray.800',
        },
      },
    },
  },
  Drawer: {
    baseStyle: {
      dialog: {
        _dark: {
          bg: 'gray.800',
        },
      },
    },
  },
  Popover: {
    baseStyle: {
      content: {
        borderRadius: 'lg',
        border: '1px solid',
        borderColor: 'gray.200',
        _dark: {
          borderColor: 'gray.700',
          bg: 'gray.800',
        },
      },
    },
  },
  Tooltip: {
    baseStyle: {
      borderRadius: 'md',
      fontWeight: 'medium',
      fontSize: 'sm',
      px: 2,
      py: 1,
    },
  },
};

// Tema final
const theme = extendTheme({
  config,
  colors,
  fonts,
  fontSizes,
  styles,
  components,
  space: {
    px: '1px',
    0.5: '0.125rem',
    1: '0.25rem',
    1.5: '0.375rem',
    2: '0.5rem',
    2.5: '0.625rem',
    3: '0.75rem',
    3.5: '0.875rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    7: '1.75rem',
    8: '2rem',
    9: '2.25rem',
    10: '2.5rem',
    12: '3rem',
    14: '3.5rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    28: '7rem',
    32: '8rem',
    36: '9rem',
    40: '10rem',
    44: '11rem',
    48: '12rem',
    52: '13rem',
    56: '14rem',
    60: '15rem',
    64: '16rem',
    72: '18rem',
    80: '20rem',
    96: '24rem',
  },
  shadows: {
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },
  radii: {
    none: '0',
    sm: '0.125rem',
    base: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
  },
});

export default theme;