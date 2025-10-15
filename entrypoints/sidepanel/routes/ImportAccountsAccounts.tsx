import { Stack, FileInput, Button, Pill } from "@mantine/core";
import { ActionFunctionArgs, Form, useActionData } from "react-router-dom";
import { ActionData, displayNotification } from "../utils/importAccounts";
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

    // Display error as notification if there is one
    useEffect(() => {
        if (actionData) {
            displayNotification(actionData);
        }
    }, [actionData])

    return (
        <Stack gap="md" align="flex-start">
            <Form method='post' encType='multipart/form-data'>
                <Stack gap="md" align="flex-start">
                    <FileInput
                        name='accountsFile'
                        accept=".json"
                        size="md"
                        required
                        withAsterisk={false}
                        label="Select a file with exported accounts to import them. Any account already added will be skipped."
                        placeholder="Choose file"
                        clearable
                        valueComponent={FileValueComponent}
                        styles={{
                            input: {
                                background: 'transparent'
                            }
                        }}
                    />
                    <Button type='submit' autoContrast>Import</Button>
                </Stack>
            </Form>
        </Stack>
    )
}

function FileValueComponent({ value }: { value: File | File[] | null }) {
    if (value === null) return null;
    if (Array.isArray(value)) return null; // just support single file
    return <Pill styles={{
        root: {
            backgroundColor: "var(--mantine-color-blue-9)",
            color: "var(--mantine-color-white)"
        }
    }}>{value.name}</Pill>
}
