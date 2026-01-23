import React from 'react'
import ReactDOM from 'react-dom/client'
import { Navigate, Outlet, RouterProvider, createBrowserRouter, redirect } from 'react-router-dom'
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
import ViewAccount, { loader as viewAccountLoader } from './routes/ViewAccount'
import { loader as filteredAccountsLoader } from './routes/FilteredAccounts'
import Layout from './layout'
import Connect, { action as connectAction, loader as connectLoader } from './routes/Connect'
import Settings, { action as settingsAction, loader as settingsLoader } from './routes/Settings'
import { createTheme, MantineProvider, rem } from '@mantine/core'
import { Notifications } from '@mantine/notifications'

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import './styles/global.css';

const router = createBrowserRouter([
  {
    element: <Layout />,
    errorElement: <ErrorPage />,
    path: "/",
    children: [
      {
        index: true,
        element: <Navigate to='/accounts/home' replace />
      },
      {
        // chrome extension default path
        // we use this whenever we open the extension programatically
        // currently we either do this on connect, or just opening the sidepanel
        // note that when we connect we need to forward query params to /accounts/connect
        path: "sidepanel.html",
        loader: ({ request }) => {
          const { search, searchParams } = new URL(request.url);
          if (searchParams.get('connect')) {
            return redirect(`/accounts/connect${search}`)
          } else {
            return redirect('/accounts/home')
          }
        }
      },
      {
        path: "accounts",
        loader: accountsLoader,
        id: "accounts-route",
        element: <Outlet />,
        shouldRevalidate: () => true,
        children: [
          {
            path: "home",
            element: <Home />,
          },
          {
            path: "settings",
            loader: settingsLoader,
            action: settingsAction,
            element: <Settings />,
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
            path: "/accounts/:address",
            loader: viewAccountLoader,
            element: <ViewAccount />
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
            path: "/accounts/connect",
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

const mantineTheme = createTheme({
  primaryColor: 'blue',
  primaryShade: 2,
  colors: {
    // blue gray preset from https://mantine.dev/colors-generator/?color=63687C
    gray: [
      "#f1f4fe",
      "#e4e6ed",
      "#c8cad3",
      "#a9adb9",
      "#9094a3",
      "#7f8496",
      "#777c91",
      "#63687c",
      "#595e72",
      "#4a5167"
    ]
  },
  spacing: {
    xxs: rem(4),
  }
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <MantineProvider theme={mantineTheme} forceColorScheme='dark'>
      <Notifications />
      <RouterProvider router={router} />
    </MantineProvider>
  </React.StrictMode>
)
