import React from 'react'
import ReactDOM from 'react-dom/client'
import { ChakraProvider, ThemeConfig, extendTheme } from '@chakra-ui/react'
import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom'
import ErrorPage from './error-page'
import Home, { loader as homeLoader } from './routes/Home'
import CreateAccount, { action as createAccountAction, loader as createAccountLoader } from './routes/CreateAccount'
import { action as deleteAccountAction } from './routes/DeleteAccount'
import EditAccount, { action as editAccountAction, loader as editAccountLoader } from './routes/EditAccount'
import ExportAccounts, { loader as exportAccountsLoader } from './routes/ExportAccounts'
import ImportAccounts from './routes/ImportAccounts'
import ImportAccountsAccounts, { action as importAccountsAccountsAction } from './routes/ImportAccountsAccounts'
import ImportAccountsAddresses, { action as importAccountsAddressesAction } from './routes/ImportAccountsAddresses'
import Layout from './layout'
import Connect, { loader as connectLoader } from './routes/Connect'

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
        path: "/account/export",
        loader: exportAccountsLoader,
        element: <ExportAccounts />,
      },
      {
        path: "/account/import",
        element: <ImportAccounts />,
        children: [
          {
            index: true,
            element: <Navigate to='addresses' replace />
          },
          {
            path: "/account/import/addresses",
            action: importAccountsAddressesAction,
            element: <ImportAccountsAddresses />
          },
          {
            action: importAccountsAccountsAction,
            path: "/account/import/accounts",
            element: <ImportAccountsAccounts />
          }
        ]
      },
      {
        path: "/account/:address/edit",
        action: editAccountAction,
        loader: editAccountLoader,
        element: <EditAccount />
      },
      {
        path: "/account/:address/delete",
        action: deleteAccountAction
      },
      {
        path: "/connect/:tabId/:requestId",
        loader: connectLoader,
        element: <Connect />
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
