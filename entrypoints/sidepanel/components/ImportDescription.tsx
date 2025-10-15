import { Stack, Text } from "@mantine/core"
import type { Address } from "@solana/addresses"
import { shortAddress } from "../utils/address"

export default function ImportDescription({ importedCount, skipped, invalid }: { importedCount: number, skipped: Address[], invalid: string[] }) {
    const summary = importedCount > 0 ? `Successfully imported ${importedCount} address${importedCount === 1 ? '' : 'es'}` : 'Unable to import any addresses'

    return (
        <Stack gap={0}>
            <Text>{summary}</Text>
            {skipped.length > 0 ? skipped.length > 10 ? <Text>Skipped {skipped.length} duplicate addresses</Text> : <Text>Skipped duplicate addresses: {skipped.map(shortAddress).join(', ')}</Text> : null}
            {invalid.length > 0 ? invalid.length > 10 ? <Text>Skipped {invalid.length} invalid addresses</Text> : <Text>Invalid addresses not imported: {invalid.map(shortAddress).join(', ')}</Text> : null}
        </Stack>
    )
}
