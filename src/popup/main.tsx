import React from 'react'
import ReactDOM from 'react-dom/client'
import { ChakraProvider, ThemeConfig, extendTheme } from '@chakra-ui/react'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import ErrorPage from './error-page'
import Home, { loader as homeLoader } from './routes/Home'
import NewAddress, { action as newAddressAction, loader as newAddressLoader } from './routes/NewAddress'
import Layout from './layout'
import Connect from './routes/Connect'

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false
}
const theme = extendTheme({ config })

const router = createBrowserRouter([
  {
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        // chrome extension default path
        path: "/index.html",
        loader: homeLoader,
        element: <Home />
      },
      {
        path: "/address",
        action: newAddressAction,
        loader: newAddressLoader,
        element: <NewAddress />,
      },
      {
        path: "/connect",
        element: <Connect tabId={0} requestId={0} forOrigin={''} />
      }
    ]
  }
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <RouterProvider router={router} />
    </ChakraProvider>
  </React.StrictMode>
)
