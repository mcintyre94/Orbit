import React from 'react'
import ReactDOM from 'react-dom/client'
import { ChakraProvider, ThemeConfig, extendTheme } from '@chakra-ui/react'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import ErrorPage from './error-page'
import Home, { loader as homeLoader } from './routes/Home'
import CreateAccount, { action as createAccountAction, loader as createAccountLoader } from './routes/CreateAccount'
import EditAccount, { action as editAccountAction, loader as editAccountLoader } from './routes/EditAccount'
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
        path: "/account/new",
        action: createAccountAction,
        loader: createAccountLoader,
        element: <CreateAccount />,
      },
      {
        path: "/account/:address/edit",
        action: editAccountAction,
        loader: editAccountLoader,
        element: <EditAccount />
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
