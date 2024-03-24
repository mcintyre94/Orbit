import { Link, LoaderFunctionArgs, useLoaderData, useSubmit } from "react-router-dom";
import { Box, Button, ButtonGroup, Flex, IconButton, Menu, MenuButton, MenuItem, MenuList, VStack } from "@chakra-ui/react";
import TagFilters from "../components/TagFilters";
import AccountDisplay from "../components/AccountDisplay";
import { getAccountsAndTags } from "../utils";
import { AddIcon, SettingsIcon } from "@chakra-ui/icons";

export async function loader({ request }: LoaderFunctionArgs) {
    const { searchParams } = new URL(request.url);

    const enableFilters = searchParams.get("enableFilters");
    const filtersEnabled = enableFilters === "enabled";
    let tagsInSearch = new Set(searchParams.getAll("tag"));

    const { accounts, tags } = await getAccountsAndTags(filtersEnabled, tagsInSearch);
    return { accounts, filtersEnabled, tags };
}

export default function Home() {
    const { accounts, filtersEnabled, tags } = useLoaderData() as Awaited<ReturnType<typeof loader>>;
    const submit = useSubmit();

    return (
        <VStack spacing={8} alignItems='flex-start'>
            <ButtonGroup>
                <Link to='/account/new'>
                    <Button colorScheme='blue' leftIcon={<AddIcon />}>Add Account</Button>
                </Link>

                <Menu>
                    <MenuButton colorScheme='blue' variant='outline' as={IconButton} icon={<SettingsIcon />} aria-label="settings" />
                    <MenuList>
                        <Link to='/account/export'><MenuItem isDisabled={accounts.length === 0}>Export</MenuItem></Link>
                        <Link to='/account/import'><MenuItem>Import</MenuItem></Link>
                    </MenuList>
                </Menu>
            </ButtonGroup>

            {/* TODO: use url replace to stop navigation getting messed up (we have swipe back/forward, should have clean history) */}
            <TagFilters tags={tags} filtersEnabled={filtersEnabled} submit={submit} />

            <Flex direction='column' alignItems='flex-start' width='100%'>
                {accounts.map(account => (
                    <Box width='100%' key={account.address}>
                        <Link to={`/account/${account.address}/edit`}>
                            <AccountDisplay account={account} />
                        </Link>
                    </Box>
                ))}
            </Flex>
        </VStack>
    )
}