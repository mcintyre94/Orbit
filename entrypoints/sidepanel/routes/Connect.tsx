import type { Address } from "@solana/addresses";
import { makeConnectionSubmitEvent } from "../events";
import { ActionFunctionArgs, FetcherWithComponents, Form, LoaderFunctionArgs, useFetcher, useLoaderData, useRouteLoaderData } from "react-router-dom";
import { Box, Button, CheckboxProps, Flex, HStack, Heading, Spacer, UseCheckboxGroupReturn, VStack, useCheckbox, useCheckboxGroup } from "@chakra-ui/react";
import AccountDisplay from "../components/AccountDisplay";
import TagFilters from "../components/TagFilters";
import { getFilteredAccountsData } from "../utils/filterAccounts";
import { FilteredAccountsLoaderData } from "./FilteredAccounts";
import { SavedAccount } from "../../../accounts/savedAccount";
import { useMemo } from "react";
import { getSavedConnection } from "@/connections/storage";

type SidePanel = {
    setOptions({
        path,
        enabled,
    }: {
        path: string;
        enabled?: boolean;
    }): Promise<void>;
};

export async function loader({ request }: LoaderFunctionArgs) {
    const { searchParams } = new URL(request.url);

    const tabIdString = searchParams.get('tabId');
    if (!tabIdString) throw new Error('tabId query param is required for connect')
    const tabId = Number(tabIdString)
    if (Number.isNaN(tabId)) throw new Error(`tabId query param should be a number, got ${tabIdString}`)

    const requestIdString = searchParams.get('requestId');
    if (!requestIdString) throw new Error('requestId query param is required for connect')
    const requestId = Number(requestIdString)
    if (Number.isNaN(requestId)) throw new Error(`requestId should be a number, got ${requestIdString}`)

    const encodedForOrigin = searchParams.get('forOrigin');
    if (!encodedForOrigin) throw new Error('forOrigin query param is required for connect')
    const forOrigin = decodeURIComponent(encodedForOrigin);

    const connectedAddressesForOrigin = (await getSavedConnection(forOrigin)) ?? [];

    return { tabId, requestId, forOrigin, connectedAddressesForOrigin };
}

interface FormDataUpdates {
    tabIdInput: string;
    requestIdInput: string;
    forOriginInput: string;
}

export async function action({ request }: ActionFunctionArgs) {
    const formData = await request.formData();
    const updates = Object.fromEntries(formData) as unknown as FormDataUpdates;

    const tabId = Number(updates.tabIdInput);
    const requestId = Number(updates.requestIdInput);
    const forOrigin = updates.forOriginInput;

    // Object.fromEntries doesn't get all for checkboxes
    const addresses = formData.getAll('addressInput') as Address[];

    await sendAndClose(tabId, requestId, forOrigin, addresses);
}

async function sendAndClose(tabId: number, requestId: number, forOrigin: string, addresses: Address[]) {
    await browser.runtime.sendMessage(makeConnectionSubmitEvent({
        tabId,
        requestId,
        forOrigin,
        addresses,
    }))

    // if in panel, this will make sure if user opens it from action button
    // then it'll open the expected home page
    const sidePanel = (browser as { sidePanel?: unknown })
        .sidePanel as unknown as SidePanel;

    await sidePanel.setOptions({ path: 'sidepanel.html' });

    // close popup window, or hide sidebar panel
    window.close();
}

function AccountAsCheckbox(props: CheckboxProps) {
    const { state, getCheckboxProps, getInputProps, getLabelProps, htmlProps } =
        useCheckbox(props)

    return (
        <Box paddingBottom={1}>
            <Box
                as='label'
                {...htmlProps}
            >
                <input {...getInputProps()} name='addressInput' hidden />
                <Box
                    width='100%'
                    cursor='pointer'
                    borderLeftColor={state.isChecked ? 'blue.100' : 'transparent'}
                    borderLeftWidth={4}
                    {...getCheckboxProps()}
                >
                    {props.children}
                </Box>
            </Box>
        </Box>
    )
}

type AccountsListProps = {
    allAccounts: SavedAccount[];
    filteredAddresses: Set<Address>;
    getCheckboxProps: UseCheckboxGroupReturn['getCheckboxProps']
}

// Custom checkboxes in Chakra: https://v2.chakra-ui.com/docs/hooks/use-checkbox-group
function AccountsList({ allAccounts, filteredAddresses, getCheckboxProps }: AccountsListProps) {
    return (
        <Box>
            {allAccounts.map((account) => {
                const checkbox = getCheckboxProps({ value: account.address })
                if (!filteredAddresses.has(account.address)) {
                    // If an address is filtered out but is checked, render a hidden input with its address
                    // This ensures that we connect all checked accounts, not just visible ones
                    if ('isChecked' in checkbox && checkbox.isChecked) {
                        return (
                            <input type='hidden' name='addressInput' value={account.address} />
                        )
                    } else {
                        return null
                    }
                }

                return (
                    <AccountAsCheckbox key={account.address} {...checkbox} /* submit={submit} */>
                        <AccountDisplay account={account} />
                    </AccountAsCheckbox>
                )
            })}
        </Box>
    )
}

export default function Connect() {
    const loaderData = useLoaderData() as Awaited<ReturnType<typeof loader>>;
    const { tabId, requestId, forOrigin, connectedAddressesForOrigin } = loaderData;
    const filtersFetcher = useFetcher() as FetcherWithComponents<FilteredAccountsLoaderData>;
    const routeLoaderData = useRouteLoaderData('accounts-route') as FilteredAccountsLoaderData;
    const { accounts: filteredAccounts, tags, filtersEnabled, searchQuery } = getFilteredAccountsData(routeLoaderData, filtersFetcher.data);
    const filteredAddresses = useMemo(() => new Set(filteredAccounts.map(account => account.address)), [filteredAccounts]);
    const { value: selectedAddresses, getCheckboxProps } = useCheckboxGroup({
        // TODO: for now we only do connect UI when there's no existing connections, probably will rework this a bit
        // in that case, will need to pass the current selections in here
        defaultValue: connectedAddressesForOrigin,
        onChange(value) {
            console.log('checkbox changed!', { value })
        }
    });

    return (
        <>
            <Flex direction='column' minHeight='100vh'>
                <VStack spacing={8} alignItems='flex-start'>
                    <Heading as='h3' size='lg'>Connect to {forOrigin}</Heading>

                    <TagFilters tags={tags} filtersEnabled={filtersEnabled} searchQuery={searchQuery} fetcher={filtersFetcher} />

                    <Flex direction='column' alignItems='flex-start' width='100%' marginBottom={2}>
                        <Box width='100%'>
                            <Form method="post" id="accounts-form" onReset={() => sendAndClose(tabId, requestId, forOrigin, [])}>
                                <input type='hidden' name='tabIdInput' value={tabId} />
                                <input type='hidden' name='requestIdInput' value={requestId} />
                                <input type='hidden' name='forOriginInput' value={forOrigin} />
                                <AccountsList allAccounts={routeLoaderData.accounts} filteredAddresses={filteredAddresses} getCheckboxProps={getCheckboxProps} />
                            </Form>
                        </Box>
                    </Flex>

                </VStack>
                <Spacer />
            </Flex>
            <Box maxW='48em' sx={{ position: 'sticky', bottom: '1em', }}>
                <HStack justifyContent='center' gap={8}>
                    <Button form='accounts-form' type='submit' isDisabled={selectedAddresses.length === 0} colorScheme='blue' size='md' paddingY={4}>Connect {selectedAddresses.length} {selectedAddresses.length === 1 ? "Account" : "Accounts"}</Button>
                    <Button form='accounts-form' type='reset' color='blue.100' size='md' paddingY={4}>Cancel</Button>
                </HStack>
            </Box>
        </>
    )
}
