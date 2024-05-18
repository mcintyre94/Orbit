import { Link as ReactRouterLink, Outlet, NavLink } from "react-router-dom";
import { Box, Button, Flex, Link, VStack, Heading, Spacer, HStack } from "@chakra-ui/react";

export default function ImportAccounts() {
    return (
        <Flex direction='column' minHeight='100vh'>
            <VStack spacing={8} alignItems='flex-start'>
                <Heading alignSelf='center' as='h1' size='xl'>Import Accounts</Heading>

                <HStack gap='8'>
                    <Link to='addresses' as={NavLink} fontSize='large' _activeLink={{ color: 'lightblue', fontWeight: 'bold', textDecoration: 'underline' }}>Addresses</Link>
                    <Link to='accounts' as={NavLink} fontSize='large' _activeLink={{ color: 'lightblue', fontWeight: 'bold', textDecoration: 'underline' }}>Accounts</Link>
                </HStack>

                <Outlet />
            </VStack>
            <Spacer />
            <Box marginBottom={8} marginTop={8}>
                <Link to='/sidepanel.html' as={ReactRouterLink}>
                    <Button colorScheme='white' variant='outline'>
                        Back
                    </Button>
                </Link>
            </Box>
        </Flex >
    )
}
