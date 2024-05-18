import { Box, VStack, Text, Textarea, Button, useToast } from "@chakra-ui/react";
import { ActionFunctionArgs, Form, useActionData } from "react-router-dom";
import { importAddresses } from "~/accounts/storage";
import { useEffect } from "react";
import { ActionData, displayToast } from "../utils/importAccounts";

type FormDataUpdates = {
    addresses: string;
}

export async function action({ request }: ActionFunctionArgs): Promise<ActionData | null> {
    const formData = await request.formData();
    const updates = Object.fromEntries(formData) as unknown as FormDataUpdates;

    const addresses = updates.addresses.split('\n').map(a => a.trim());
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

export default function ImportAccountAddresses() {
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
        <VStack spacing={4} alignItems='flex-start'>
            <Text fontSize='md'>Enter one address per line to bulk import. Any address already added will be skipped.</Text>
            <Box width='100%'>
                <Form method='post'>
                    <VStack spacing={4} alignItems='flex-start'>
                        <Textarea isRequired={true} aria-required='true' name='addresses' fontSize='sm' whiteSpace='pre' overflowWrap='normal' borderColor='white' borderWidth={1} rows={10} width='100%' resize='vertical' colorScheme='blue' size='lg' />
                        <Button type='submit'>Import</Button>
                    </VStack>
                </Form>
            </Box>
        </VStack>
    )
}