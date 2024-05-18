import { useToast } from "@chakra-ui/react";
import { Address } from "@solana/addresses";
import ImportDescription from "../components/ImportDescription";

export type ActionData = {
    responseType: 'imported successfully';
    importedCount: number;
    skipped: Address[];
    invalid: string[];
} | {
    responseType: 'error';
    error: string;
}

export function displayToast(actionData: ActionData, toast: ReturnType<typeof useToast>) {
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