import { Link, LoaderFunctionArgs, useLoaderData, useNavigate, useSubmit } from "react-router-dom";
import { Box, Button, ButtonGroup, Code, Flex, IconButton, Menu, MenuButton, MenuItem, MenuList, Tab, TabList, TabPanel, TabPanels, Tabs, VStack, Text, useClipboard, Heading } from "@chakra-ui/react";
import TagFilters from "../components/TagFilters";
import AccountDisplay from "../components/AccountDisplay";
import { getAccountsAndTags } from "../utils";
import { AddIcon, CopyIcon, DownloadIcon, SettingsIcon } from "@chakra-ui/icons";
import { useMemo } from "react";

export async function loader({ request }: LoaderFunctionArgs) {
    const { searchParams } = new URL(request.url);

    const enableFilters = searchParams.get("enableFilters");
    const filtersEnabled = enableFilters === "enabled";
    let tagsInSearch = new Set(searchParams.getAll("tag"));

    const { accounts, tags } = await getAccountsAndTags(filtersEnabled, tagsInSearch);
    return { accounts, filtersEnabled, tags };
}

function ExportableText({ text, contentType }: { text: string, contentType: 'text/plain' | 'application/json' }) {
    const clipboard = useClipboard(text);

    const downloadUrl = useMemo(() => {
        const blob = new Blob([text], { type: contentType });
        return URL.createObjectURL(blob);
    }, [text, contentType]);

    const downloadFilename = useMemo(() => {
        if (contentType === 'application/json') {
            return 'accounts.json'
        } else {
            return 'addresses.txt'
        }
    }, [contentType]);

    return (
        <VStack spacing={4} alignItems='flex-start'>
            <ButtonGroup size='xs'>
                <Button leftIcon={<CopyIcon />} onClick={() => clipboard.onCopy()}>{clipboard.hasCopied ? 'Copied' : 'Copy'}</Button>
                <Button leftIcon={<DownloadIcon />} onClick={async () => {
                    await chrome.downloads.download({
                        url: downloadUrl,
                        filename: downloadFilename,
                        saveAs: true,
                    })
                }}>Download</Button>
            </ButtonGroup>

            <Text fontSize='md' whiteSpace='pre-wrap' borderWidth='1px' borderRadius='md' padding={2}>{text}</Text>



        </VStack >
    )
}

export default function ExportAccounts() {
    const { accounts, filtersEnabled, tags } = useLoaderData() as Awaited<ReturnType<typeof loader>>;
    const submit = useSubmit();

    return (
        <VStack spacing={8} alignItems='flex-start'>
            <Heading alignSelf='center' as='h1' size='xl' noOfLines={1}>Export Accounts</Heading>

            <TagFilters tags={tags} filtersEnabled={filtersEnabled} submit={submit} />

            <Box>
                <Tabs minWidth='100%'>
                    <TabList>
                        <Tab>Addresses</Tab>
                        <Tab>Code</Tab>
                    </TabList>

                    <TabPanels>
                        <TabPanel>
                            <ExportableText text={accounts.map(a => a.address).join('\n')} contentType='text/plain' />
                        </TabPanel>
                        <TabPanel>
                            <ExportableText text={JSON.stringify(accounts, null, 2)} contentType='application/json' />
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </Box>

            <Link to='/index.html'>
                <Button colorScheme='white' variant='outline'>
                    Back
                </Button>
            </Link>
        </VStack>
    )
}
