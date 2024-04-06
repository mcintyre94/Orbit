import { useFetcher, useRouteLoaderData } from "react-router-dom";
import { FilteredAccountsLoaderData } from "./FilteredAccounts";
import { getFilteredAccountsData } from "../utils/filterAccounts";
import ExportableText from "../components/ExportableText";

export default function ExportAccountsAddresses() {
    const loaderData = useRouteLoaderData("accounts-route") as FilteredAccountsLoaderData;;
    const fetcher = useFetcher({ key: "export-accounts-fetcher" });
    const { accounts } = getFilteredAccountsData(loaderData, fetcher.data)
    const addresses = accounts.map(a => a.address).join('\n');

    return <ExportableText text={addresses} contentType='text/plain' />
}
