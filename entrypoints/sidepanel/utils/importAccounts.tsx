import { notifications } from '@mantine/notifications';
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

export function displayNotification(actionData: ActionData) {
    if (actionData.responseType === 'error') {
        notifications.show({
            title: 'Error importing',
            message: actionData.error,
            color: 'red',
            autoClose: 10_000,
        })
    } else {
        const { importedCount, skipped, invalid } = actionData;

        if (importedCount > 0) {
            notifications.show({
                title: 'Imported',
                message: <ImportDescription importedCount={importedCount} skipped={skipped} invalid={invalid} />,
                color: 'green',
            });
        } else {
            notifications.show({
                title: 'Could not import',
                message: <ImportDescription importedCount={0} skipped={skipped} invalid={invalid} />,
                color: 'blue',
            });
        }
    }
}