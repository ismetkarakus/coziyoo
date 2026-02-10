import { createTheme } from '@mui/material/styles'

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#111111',
      light: '#3a3a3a',
      dark: '#000000',
    },
    secondary: {
      main: '#8b7a66',
      light: '#b0a899',
      dark: '#5a4f43',
    },
    background: {
      default: '#f6f3ee',
      paper: '#ffffff',
    },
    text: {
      primary: '#111111',
      secondary: '#5a4f43',
    },
  },
  typography: {
    fontFamily: "'Space Grotesk', system-ui, sans-serif",
  },
})

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#e8e8e8',
      light: '#f0f0f0',
      dark: '#d4d4d4',
    },
    secondary: {
      main: '#888888',
      light: '#999999',
      dark: '#707070',
    },
    background: {
      default: '#1a1a1a',
      paper: '#2a2a2a',
    },
    text: {
      primary: '#e8e8e8',
      secondary: '#b0b0b0',
    },
  },
  typography: {
    fontFamily: "'Space Grotesk', system-ui, sans-serif",
  },
})
