import React from 'react'
import ReactDOM from 'react-dom/client'
import { ChakraProvider, ThemeConfig, extendTheme } from '@chakra-ui/react'
import { Navigate, Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom'
import ErrorPage from './error-page'
import { loader as accountsLoader } from './routes/Accounts'
import Home from './routes/Home'
import CreateAccount, { action as createAccountAction } from './routes/CreateAccount'
import { action as deleteAccountAction } from './routes/DeleteAccount'
import EditAccount, { action as editAccountAction, loader as editAccountLoader } from './routes/EditAccount'
import ExportAccounts from './routes/ExportAccounts'
import ExportAccountsAccounts from './routes/ExportAccountsAccounts';
import ExportAccountsAddresses from './routes/ExportAccountsAddresses';
import ImportAccounts from './routes/ImportAccounts'
import ImportAccountsAccounts, { action as importAccountsAccountsAction } from './routes/ImportAccountsAccounts'
import ImportAccountsAddresses, { action as importAccountsAddressesAction } from './routes/ImportAccountsAddresses'
import { loader as filteredAccountsLoader } from './routes/FilteredAccounts'
import Layout from './layout'
import Connect, { action as connectAction, loader as connectLoader } from './routes/Connect'

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false
}
const theme = extendTheme({ config })

const router = createBrowserRouter([
  {
    element: <Layout />,
    errorElement: <ErrorPage />,
    path: "/",
    children: [
      {
        // chrome extension default path
        path: "index.html",
        element: <Navigate to='/accounts/home' replace />
      },
      {
        path: "accounts",
        loader: accountsLoader,
        id: "accounts-route",
        element: <Outlet />,
        children: [
          {
            path: "home",
            element: <Home />,
          },
          {
            path: "new",
            action: createAccountAction,
            element: <CreateAccount />,
          },
          {
            path: "export",
            element: <ExportAccounts />,
            children: [
              {
                index: true,
                element: <Navigate to='addresses' replace />
              },
              {
                path: "addresses",
                element: <ExportAccountsAddresses />
              },
              {
                path: "accounts",
                element: <ExportAccountsAccounts />
              }
            ]
          },
          {
            path: "import",
            element: <ImportAccounts />,
            children: [
              {
                index: true,
                element: <Navigate to='addresses' replace />
              },
              {
                path: "addresses",
                action: importAccountsAddressesAction,
                element: <ImportAccountsAddresses />
              },
              {
                path: "accounts",
                action: importAccountsAccountsAction,
                element: <ImportAccountsAccounts />
              }
            ]
          },
          {
            path: "/accounts/:address/edit",
            action: editAccountAction,
            loader: editAccountLoader,
            element: <EditAccount />
          },
          {
            path: "/accounts/:address/delete",
            action: deleteAccountAction
          },
          {
            path: "connect/:tabId/:requestId",
            loader: connectLoader,
            action: connectAction,
            element: <Connect />
          },
        ]
      },
      {
        path: "/filtered-accounts",
        loader: filteredAccountsLoader,
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
