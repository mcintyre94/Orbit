import { VStack, Input, Button, Text, useToast } from "@chakra-ui/react";
import { ActionFunctionArgs, Form, useActionData } from "react-router-dom";
import { ActionData, displayToast } from "../utils/importAccounts";
import { z } from "zod";
import { SavedAccount, savedAccountSchema } from "~/accounts/savedAccount";
import { importAccounts } from "~/accounts/storage";
import { useEffect } from "react";

type FormDataUpdates = {
    importType: 'accounts';
    accountsFile: File;
}

export async function action({ request }: ActionFunctionArgs): Promise<ActionData | null> {
    const formData = await request.formData();
    const updates = Object.fromEntries(formData) as unknown as FormDataUpdates;

    // validate the file as a list of accounts
    // if any issues (including invalid addresses), just error, user probably chose the wrong file
    const accountsSchema = z.array(savedAccountSchema);
    let accounts: SavedAccount[] = [];
    try {
        accounts = accountsSchema.parse(JSON.parse(await updates.accountsFile.text())) as SavedAccount[];
    } catch {
        // parse error
        return { responseType: 'error', error: 'Invalid file, does not contain accounts' }
    }

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

export default function ImportAccountsAccount() {
    const actionData = useActionData() as ActionData | undefined;
    const toast = useToast();

    // Display error as toast if there is one
    useEffect(() => {
        if (actionData) {
            displayToast(actionData, toast);
        }
    }, [actionData])

    return (
        <VStack spacing={4} alignItems='flex-start'>
            <Text fontSize='md'>Select a file with exported accounts to import them. Any account already added will be skipped.</Text>
            <Form method='post' encType='multipart/form-data'>
                <VStack spacing={4} alignItems='flex-start'>
                    <Input type='file' isRequired={true} aria-required='true' name='accountsFile' accept=".json" />
                    <Button type='submit'>Import</Button>
                </VStack>
            </Form>
        </VStack>
    )
}