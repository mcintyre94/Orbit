import { getUnfilteredAccountsData } from "../utils/filterAccounts";
import { FilteredAccountsLoaderData } from "./FilteredAccounts";

export function loader(): Promise<FilteredAccountsLoaderData> {
    return getUnfilteredAccountsData();
}
