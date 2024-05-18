import { Box, Button, Heading, Text, VStack } from "@chakra-ui/react";
import { Link, useRouteError } from "react-router-dom";

type ReactRouterError = {
    statusText?: string,
    message?: string
}

export default function ErrorPage() {
    const error = useRouteError() as ReactRouterError;
    console.error(error);

    return (
        <Box marginTop={4}>
            <VStack spacing={8}>
                <Heading as='h1' size='xl' noOfLines={1}>Oops!</Heading>

                <Text fontSize='md'>Sorry, an unexpected error has occurred.</Text>
                <Text fontSize='md'>
                    <i>{error.statusText || error.message}</i>
                </Text>
                <Link to="/sidepanel.html">
                    <Button>Home</Button>
                </Link>
            </VStack>
        </Box>
    );
}
