import type { Address } from "@solana/addresses";
import { makeConnectionSubmitEvent } from "../events";
import { ActionFunctionArgs, FetcherWithComponents, Form, LoaderFunctionArgs, SubmitFunction, useFetcher, useLoaderData, useRouteLoaderData, useSubmit } from "react-router-dom";
import { Box, Button, Center, Flex, HStack, Heading, RadioProps, Spacer, VStack, useRadio, useRadioGroup } from "@chakra-ui/react";
import AccountDisplay from "../components/AccountDisplay";
import TagFilters from "../components/TagFilters";
import { getFilteredAccountsData } from "../utils/filterAccounts";
import { FilteredAccountsLoaderData } from "./FilteredAccounts";
import { SavedAccount } from "../../accounts/savedAccount";

interface Params {
    tabId: string;
    requestId: string;
}

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

    return { tabId, requestId, forOrigin };
}

interface FormDataUpdates {
    tabIdInput: string;
    requestIdInput: string;
    forOriginInput: string;
    addressInput: Address;
}

export async function action({ request }: ActionFunctionArgs) {
    const formData = await request.formData();
    const updates = Object.fromEntries(formData) as unknown as FormDataUpdates;

    const tabId = Number(updates.tabIdInput);
    const requestId = Number(updates.requestIdInput);
    const { addressInput: address, forOriginInput: forOrigin } = updates;

    await sendAndClose(tabId, requestId, forOrigin, address);
}

async function sendAndClose(tabId: number, requestId: number, forOrigin: string, address: Address | null) {
    await chrome.runtime.sendMessage(makeConnectionSubmitEvent({
        tabId,
        requestId,
        forOrigin,
        addresses: address ? [address] : []
    }))

    // if in panel, this will make sure if user opens it from action button
    // then it'll open the expected home page
    await chrome.sidePanel.setOptions({ path: 'index.html' });

    // close popup window, or hide sidebar panel
    window.close();
}

function AccountAsRadio(props: RadioProps & { submit: SubmitFunction }) {
    const { getInputProps, getRadioProps } = useRadio(props)

    const input = getInputProps()
    const checkbox = getRadioProps()

    return (
        <Box as='label'>
            <input {...input} onChange={(event) => {
                props.submit(event.currentTarget.form);
            }} />
            <Box
                {...checkbox}
                width='100%'
                cursor='pointer'
            >
                {props.children}
            </Box>
        </Box>
    )
}

// Custom radio button in Chakra: https://chakra-ui.com/docs/components/radio#custom-radio-buttons
function AccountsList({ accounts, submit }: { accounts: SavedAccount[], submit: SubmitFunction }) {
    const { getRootProps, getRadioProps } = useRadioGroup({
        name: 'addressInput'
    })

    const group = getRootProps()

    return (
        <Box {...group}>
            {accounts.map((account) => {
                const radio = getRadioProps({ value: account.address })
                return (
                    <AccountAsRadio key={account.address} {...radio} submit={submit}>
                        <AccountDisplay account={account} />
                    </AccountAsRadio>
                )
            })}
        </Box>
    )
}

export default function Connect() {
    const loaderData = useLoaderData() as Awaited<ReturnType<typeof loader>>;
    const { tabId, requestId, forOrigin } = loaderData;
    const filtersFetcher = useFetcher() as FetcherWithComponents<FilteredAccountsLoaderData>;
    const routeLoaderData = useRouteLoaderData('accounts-route') as FilteredAccountsLoaderData;
    const { accounts, tags, filtersEnabled, searchQuery } = getFilteredAccountsData(routeLoaderData, filtersFetcher.data);
    const submit = useSubmit();

    return (
        <>
            <Flex direction='column' minHeight='100vh'>
                <VStack spacing={8} alignItems='flex-start'>
                    <Heading as='h3' size='lg'>Connect to {forOrigin}</Heading>

                    <TagFilters tags={tags} filtersEnabled={filtersEnabled} searchQuery={searchQuery} fetcher={filtersFetcher} />

                    <Flex direction='column' alignItems='flex-start' width='100%' marginBottom={4}>
                        <Box width='100%'>
                            <Form method="post" id="accounts-form" onReset={() => sendAndClose(tabId, requestId, forOrigin, null)}>
                                <input type='hidden' name='tabIdInput' value={tabId} />
                                <input type='hidden' name='requestIdInput' value={requestId} />
                                <input type='hidden' name='forOriginInput' value={forOrigin} />
                                <AccountsList accounts={accounts} submit={submit} />
                            </Form>
                        </Box>
                    </Flex>

                </VStack>
                <Spacer />
                {/* <Box marginBottom={8}>
                <Button form='accounts-form' type='reset' colorScheme='blue' size='md' paddingY={4}>Cancel</Button>
            </Box> */}
            </Flex>
            <Box maxW='48em' sx={{ position: 'sticky', bottom: '1em', }}>
                <HStack justifyContent='center' gap={8}>
                    <Button form='accounts-form' type='submit' colorScheme='blue' size='md' paddingY={4}>Connect X Accounts</Button>
                    <Button form='accounts-form' type='reset' color='blue.100' size='md' paddingY={4}>Cancel</Button>
                </HStack>
            </Box>
        </>
    )
}
