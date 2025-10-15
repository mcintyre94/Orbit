import { Box, Button, Title, Text, Stack } from "@mantine/core";
import { Link, useRouteError } from "react-router-dom";

type ReactRouterError = {
    statusText?: string,
    message?: string
}

export default function ErrorPage() {
    const error = useRouteError() as ReactRouterError;
    console.error(error);

    return (
        <Box mt="md">
            <Stack gap="lg" ta='center'>
                <Title order={1} lineClamp={1}>Oops!</Title>

                <Text size="md">Sorry, an unexpected error has occurred.</Text>
                <Text size="md" fs="italic">
                    {error.statusText || error.message}
                </Text>
                <Link to="/sidepanel.html">
                    <Button autoContrast>Home</Button>
                </Link>
            </Stack>
        </Box>
    );
}
