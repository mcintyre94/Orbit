import type { Address } from "@solana/web3.js";
import { makeConnectionSubmitEvent } from "../events";
import { FetcherWithComponents, LoaderFunctionArgs, useFetcher, useLoaderData } from "react-router-dom";
import { Box, Button, Flex, Heading, Spacer, VStack } from "@chakra-ui/react";
import AccountDisplay from "../components/AccountDisplay";
import TagFilters from "../components/TagFilters";
import { getAccountsAndTags, getFilteredAccountsData } from "../utils/filterAccounts";
import { FilteredAccountsLoaderData } from "./FilteredAccounts";

interface Params {
    tabId: string;
    requestId: string;
}

export async function loader({ request, params }: LoaderFunctionArgs) {
    const { tabId: tabIdString, requestId: requestIdString } = params as unknown as Params;

    const tabId = Number(tabIdString);
    if (Number.isNaN(tabId)) throw new Error(`tabId should be a number, got ${tabIdString}`)

    const requestId = Number(requestIdString);
    if (Number.isNaN(requestId)) throw new Error(`requestId should be a number, got ${requestIdString}`)

    const { searchParams } = new URL(request.url);
    const encodedForOrigin = searchParams.get('forOrigin');
    if (!encodedForOrigin) throw new Error('forOrigin is required for connect')
    const forOrigin = decodeURIComponent(encodedForOrigin);

    const filtersEnabled = false;
    const { accounts, tags } = await getAccountsAndTags(filtersEnabled, new Set())
    return { tabId, requestId, forOrigin, accounts, filtersEnabled, tags };
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

export default function Connect() {
    const loaderData = useLoaderData() as Awaited<ReturnType<typeof loader>>;
    const { tabId, requestId, forOrigin } = loaderData;
    const fetcher = useFetcher() as FetcherWithComponents<FilteredAccountsLoaderData>;
    const { accounts, filtersEnabled, tags } = getFilteredAccountsData(loaderData, fetcher.data)

    return (
        <Flex direction='column' minHeight='100vh'>
            <VStack spacing={8} alignItems='flex-start'>
                <Heading as='h3' size='lg'>Connect to {forOrigin}</Heading>

                {/* TODO: can we remove this additional params? */}
                <TagFilters tags={tags} filtersEnabled={filtersEnabled} fetcher={fetcher} additionalSearchParams={{ forOrigin }} />

                <Flex direction='column' alignItems='flex-start' width='100%'>
                    {accounts.map(account => (
                        <Box width='100%' key={account.address} onClick={() => sendAndClose(tabId, requestId, forOrigin, account.address)} cursor='pointer'>
                            <AccountDisplay account={account} />
                        </Box>
                    ))}
                </Flex>

            </VStack>
            <Spacer />
            <Box marginBottom={8}>
                <Button colorScheme='blue' size='md' paddingY={4} onClick={() => sendAndClose(tabId, requestId, forOrigin, null)}>Cancel</Button>
            </Box>
        </Flex>
    )
}
