import { Link, LoaderFunctionArgs, useLoaderData, useSubmit } from "react-router-dom";
import { Box, Button, Flex, VStack } from "@chakra-ui/react";
import TagFilters from "../components/TagFilters";
import AccountDisplay from "../components/AccountDisplay";
import { getAccountsAndTags } from "../utils";

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
        <VStack spacing={8} alignItems='flex-start' maxHeight={4}>
            <TagFilters tags={tags} filtersEnabled={filtersEnabled} submit={submit} />

            <Link to='/account/new'>
                <Button colorScheme='blue'>Add Account</Button>
            </Link>

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