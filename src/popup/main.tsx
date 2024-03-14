import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ChakraProvider, ColorModeScript, DarkMode, ThemeConfig, extendTheme } from '@chakra-ui/react'

// import './index.css'

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false
}

const theme = extendTheme({ config })

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ChakraProvider colorModeManager={{
      type: "cookie",
      set: () => { },
      get: () => "dark",
      ssr: true,
    }}>
      <App />
    </ChakraProvider>
  </React.StrictMode>
)
