import type { Address } from "@solana/web3.js";
import { makeConnectionSubmitEvent } from "../events";
import { LoaderFunctionArgs, useLoaderData, useSubmit } from "react-router-dom";
import { Box, Button, Flex, Heading, VStack } from "@chakra-ui/react";
import AccountDisplay from "../components/AccountDisplay";
import TagFilters from "../components/TagFilters";
import { getAccountsAndTags } from "../utils";

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

    const enableFilters = searchParams.get("enableFilters");
    const filtersEnabled = enableFilters === "enabled";
    let tagsInSearch = new Set(searchParams.getAll("tag"));

    const { accounts, tags } = await getAccountsAndTags(filtersEnabled, tagsInSearch)
    return { tabId, requestId, forOrigin, accounts, tags, filtersEnabled };
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
    const { tabId, requestId, forOrigin, accounts, tags, filtersEnabled } = useLoaderData() as Awaited<ReturnType<typeof loader>>;
    const submit = useSubmit();

    return (
        <Box>
            <VStack spacing={8} alignItems='flex-start' maxHeight={4}>
                <Heading as='h3' size='lg'>Connect to {forOrigin}</Heading>

                <TagFilters tags={tags} filtersEnabled={filtersEnabled} submit={submit} additionalSearchParams={{ forOrigin }} />

                <Flex direction='column' alignItems='flex-start' width='100%'>
                    {accounts.map(account => (
                        <Box width='100%' key={account.address} onClick={() => sendAndClose(tabId, requestId, forOrigin, account.address)} cursor='pointer'>
                            <AccountDisplay account={account} />
                        </Box>
                    ))}
                </Flex>

                <Button colorScheme='blue' size='md' paddingY={4} onClick={() => sendAndClose(tabId, requestId, forOrigin, null)}>Cancel</Button>
            </VStack>
        </Box>
    )
}
