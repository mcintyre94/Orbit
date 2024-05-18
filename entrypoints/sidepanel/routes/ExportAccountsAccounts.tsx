import { useFetcher, useRouteLoaderData } from "react-router-dom";
import { FilteredAccountsLoaderData } from "./FilteredAccounts";
import { getFilteredAccountsData } from "../utils/filterAccounts";
import ExportableText from "../components/ExportableText";

export default function ExportAccountsAccounts() {
    const loaderData = useRouteLoaderData("accounts-route") as FilteredAccountsLoaderData;;
    const fetcher = useFetcher({ key: "export-accounts-fetcher" });
    const { accounts } = getFilteredAccountsData(loaderData, fetcher.data)
    const accountsDisplay = JSON.stringify(accounts, null, 2);

    return <ExportableText text={accountsDisplay} contentType='application/json' />
}
