import { ActionFunctionArgs, Form, Link, LoaderFunctionArgs, useActionData, useLoaderData, useSubmit } from "react-router-dom";
import { Box, Button, ButtonGroup, Flex, Tab, TabList, TabPanel, TabPanels, Tabs, VStack, Text, useClipboard, Heading, Spacer, Textarea, Input, useToast, addPrefix } from "@chakra-ui/react";
import TagFilters from "../components/TagFilters";
import { getAccountsAndTags } from "../utils";
import { CopyIcon, DownloadIcon } from "@chakra-ui/icons";
import { useEffect, useMemo } from "react";
import { importAccounts, importAddresses } from "../../accounts/storage";
import { Address } from "@solana/web3.js";
import { SavedAccount, savedAccountSchema } from "../../accounts/savedAccount";
import { z } from 'zod';

type FormDataUpdates = {
    importType: 'addresses';
    addresses: string;
} | {
    importType: 'accounts';
    accountsFile: File;
}

type ActionData = {
    responseType: 'imported successfully';
    importedCount: number;
    skipped: Address[];
    invalid: string[];
} | {
    responseType: 'error';
    error: string;
}

async function importAddressesAction(addresses: string[]): Promise<ActionData> {
    try {
        const { importedCount, skipped, invalid } = await importAddresses(addresses)
        return {
            responseType: 'imported successfully',
            importedCount,
            skipped,
            invalid
        } as ActionData;
    } catch (e) {
        console.error('error importing addresses', e);
        const message = e instanceof Error ? e.message : e;
        return { responseType: 'error', error: `Error importing addresses: ${message}` }
    }
}

async function importAccountsAction(accounts: SavedAccount[]): Promise<ActionData> {
    try {
        const { importedCount, skipped } = await importAccounts(accounts);
        return {
            responseType: 'imported successfully',
            importedCount,
            skipped,
            invalid: [],
        } as ActionData;
    } catch (e) {
        console.error('error importing accounts', e);
        const message = e instanceof Error ? e.message : e;
        return { responseType: 'error', error: `Error importing accounts: ${message}` }
    }
}

// TODO: too much here, can we refactor to a nested route?
export async function action({ request }: ActionFunctionArgs): Promise<ActionData | null> {
    const formData = await request.formData();
    const updates = Object.fromEntries(formData) as unknown as FormDataUpdates;

    if (updates.importType === 'addresses') {
        const addresses = updates.addresses.split('\n').map(a => a.trim());
        return await importAddressesAction(addresses);
    } else {
        // validate the file as a list of accounts
        // if any issues (including invalid addresses), just error, user probably chose the wrong file
        const accountsSchema = z.array(savedAccountSchema);
        let accountsContent: SavedAccount[] = [];
        try {
            accountsContent = accountsSchema.parse(JSON.parse(await updates.accountsFile.text())) as SavedAccount[];
        } catch {
            // parse error
            return { responseType: 'error', error: 'Invalid file, does not contain accounts' }
        }

        try {
            return await importAccountsAction(accountsContent)
        } catch (e) {
            console.error('invalid imported accounts', e);
            const message = e instanceof Error ? e.message : e;
            return { responseType: 'error', error: `Invalid accounts file: ${message}` }
        }
    }
    return null;
}

function ImportDescription({ importedCount, skipped, invalid }: { importedCount: number, skipped: Address[], invalid: string[] }) {
    const summary = importedCount > 0 ? `Successfully imported ${importedCount} addresses` : 'Unable to import any addresses'

    return (
        <Box>
            <Text>{summary}</Text>
            {skipped.length > 0 ? <Text>Skipped duplicate addresses: {skipped.join(', ')}</Text> : null}
            {invalid.length > 0 ? <Text>Invalid addresses not imported: {invalid.join(', ')}</Text> : null}
        </Box>
    )
}

function displayToast(actionData: ActionData, toast: ReturnType<typeof useToast>) {
    if (actionData.responseType === 'error') {
        toast({
            title: 'Error importing',
            description: actionData.error,
            status: 'error',
            duration: 10_000,
            isClosable: true,
        })
    } else {
        const { importedCount, skipped, invalid } = actionData;

        if (importedCount > 0) {
            toast({
                title: 'Imported',
                description: <ImportDescription importedCount={importedCount} skipped={skipped} invalid={invalid} />,
                status: 'success',
                isClosable: true,
            });
        } else {
            toast({
                title: 'Could not import',
                description: <ImportDescription importedCount={0} skipped={skipped} invalid={invalid} />,
                status: 'info',
                isClosable: true,
            });
        }
    }
}

export default function ImportAccounts() {
    const actionData = useActionData() as ActionData | undefined;
    const toast = useToast();

    console.log({ actionData });

    // Display error as toast if there is one
    useEffect(() => {
        if (actionData) {
            displayToast(actionData, toast);
        }
    }, [actionData])

    return (
        <Flex direction='column' minHeight='100vh'>
            <VStack spacing={8} alignItems='flex-start'>
                <Heading alignSelf='center' as='h1' size='xl'>Import Accounts</Heading>

                <Box>
                    <Tabs minWidth='100%'>
                        <TabList>
                            <Tab>Addresses</Tab>
                            <Tab>Accounts</Tab>
                        </TabList>

                        <TabPanels>
                            <TabPanel>
                                <VStack spacing={4} alignItems='flex-start'>
                                    <Text fontSize='md'>Enter one address per line to bulk import. Any address already added will be skipped.</Text>
                                    <Box width='100%'>
                                        <Form method='post'>
                                            <VStack spacing={4} alignItems='flex-start'>
                                                <Input type='hidden' aria-hidden='true' name='importType' value='addresses' />
                                                <Textarea isRequired={true} aria-required='true' name='addresses' fontSize='sm' whiteSpace='pre' overflowWrap='normal' borderColor='white' borderWidth={1} rows={10} width='100%' resize='vertical' colorScheme='blue' size='lg' />
                                                <Button type='submit'>Import</Button>
                                            </VStack>
                                        </Form>
                                    </Box>
                                </VStack>
                            </TabPanel>
                            <TabPanel>
                                <VStack spacing={4} alignItems='flex-start'>
                                    <Text fontSize='md'>Select a file with exported accounts to import them. Any account already added will be skipped.</Text>
                                    <Form method='post' encType='multipart/form-data'>
                                        <VStack spacing={4} alignItems='flex-start'>
                                            <Input type='hidden' aria-hidden='true' name='importType' value='accounts' />
                                            <Input type='file' isRequired={true} aria-required='true' name='accountsFile' accept=".json" />
                                            <Button type='submit'>Import</Button>
                                        </VStack>
                                    </Form>
                                </VStack>
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </Box>
            </VStack>
            <Spacer />
            <Box marginBottom={8}>
                <Link to='/index.html'>
                    <Button colorScheme='white' variant='outline'>
                        Back
                    </Button>
                </Link>
            </Box>
        </Flex>
    )
}
