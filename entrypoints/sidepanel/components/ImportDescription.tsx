import { Box, Text } from "@chakra-ui/react"
import type { Address } from "@solana/addresses"

export default function ImportDescription({ importedCount, skipped, invalid }: { importedCount: number, skipped: Address[], invalid: string[] }) {
    const summary = importedCount > 0 ? `Successfully imported ${importedCount} addresses` : 'Unable to import any addresses'

    return (
        <Box>
            <Text>{summary}</Text>
            {skipped.length > 0 ? <Text>Skipped duplicate addresses: {skipped.join(', ')}</Text> : null}
            {invalid.length > 0 ? <Text>Invalid addresses not imported: {invalid.join(', ')}</Text> : null}
        </Box>
    )
}