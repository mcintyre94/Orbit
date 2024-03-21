import { PropsWithChildren } from "react";
import { getSavedAccounts } from '../../accounts/storage';
import { shortAddress } from '../utils';
import { Form, Link, LoaderFunctionArgs, useLoaderData, useSubmit } from "react-router-dom";
import { Box, Button, CheckboxGroup, Flex, FormControl, FormLabel, HStack, Switch, Tag, Text, Tooltip, UseCheckboxProps, VStack, Wrap, WrapItem, chakra, useCheckbox, useClipboard } from "@chakra-ui/react";
import { CopyIcon } from "@chakra-ui/icons";
import { Address } from "@solana/web3.js";

export async function loader({ request }: LoaderFunctionArgs) {
    const url = new URL(request.url);

    const enableFilters = url.searchParams.get('enableFilters')
    let tagsInSearch = new Set(url.searchParams.getAll("tag"))

    let accounts = await getSavedAccounts();
    const allTagNamesSet = new Set(accounts.flatMap(a => a.tags))
    const allTagNames = [...allTagNamesSet].sort();

    const filtersEnabled = enableFilters === 'enabled';

    const tags = allTagNames.map(tag => ({
        tagName: tag,
        selected: filtersEnabled ? tagsInSearch.has(tag) : false,
    }))

    // If filters enabled, show only accounts with any selected tags
    if (filtersEnabled) {
        accounts = accounts.filter(a => a.tags.some(t => tagsInSearch.has(t)));
    }

    return { accounts, filtersEnabled, tags };
}

function TagCheckbox(props: PropsWithChildren<UseCheckboxProps>) {
    const { children } = props;
    const { state, getInputProps, htmlProps } = useCheckbox(props)

    return (
        <chakra.label
            cursor={props.isDisabled ? 'not-allowed' : 'pointer'}
            {...htmlProps}
        >
            <>
                <input {...getInputProps()} hidden />
                <Tag colorScheme='blue' variant={state.isChecked ? 'solid' : 'outline'}>{children}</Tag>
            </>
        </chakra.label>
    )
}

function CopyButton({ address }: { address: Address }) {
    const { onCopy, hasCopied } = useClipboard(address);

    if (hasCopied) {
        return <Text fontSize='sm'>Copied</Text>
    } else {
        return <CopyIcon cursor='pointer' boxSize={4} onClick={(event) => {
            // prevent following the link it's nested in
            event.preventDefault();
            onCopy();
        }} />
    }
}

export default function Home() {
    const { accounts, filtersEnabled, tags } = useLoaderData() as Awaited<ReturnType<typeof loader>>;
    const submit = useSubmit();

    return (
        <VStack spacing={8} alignItems='flex-start' maxHeight={4}>
            {tags.length > 0 ?
                <Box>
                    <Form>
                        <VStack spacing={2}>
                            <FormControl display='flex' alignItems='center'>
                                <FormLabel htmlFor='enableFilters' mb='0'>
                                    Enable filtering
                                </FormLabel>
                                <Switch
                                    name='enableFilters'
                                    id='enableFilters'
                                    value='enabled'
                                    defaultChecked={filtersEnabled}
                                    onChange={(event) => {
                                        submit(event.currentTarget.form);
                                    }}
                                />
                            </FormControl>
                            <Wrap alignSelf='center'>
                                <CheckboxGroup colorScheme='blue'>
                                    {tags.map(tag =>
                                        <WrapItem key={tag.tagName}>
                                            <TagCheckbox
                                                name='tag'
                                                value={tag.tagName}
                                                onChange={(event) => {
                                                    submit(event.currentTarget.form);
                                                }}
                                                isChecked={tag.selected}
                                                isDisabled={!filtersEnabled}
                                            >{tag.tagName}</TagCheckbox>
                                        </WrapItem>
                                    )}
                                </CheckboxGroup>
                            </Wrap>
                        </VStack>
                    </Form>
                </Box>
                : null
            }

            <Link to='/account/new'>
                <Button colorScheme='blue'>Add Account</Button>
            </Link>

            <Flex direction='column' alignItems='flex-start' width='100%'>
                {accounts.map(account => (
                    <Box width='100%' key={account.address}>
                        <Link to={`/account/${account.address}/edit`}>
                            <VStack padding={4} key={account.address} spacing={1} alignItems='flex-start' _hover={{ backgroundColor: 'gray.700' }}>
                                <HStack>
                                    <Text as='span' fontSize='lg'>{account.label}</Text>
                                    <Tooltip label={account.address}>
                                        <Text as='span' fontSize='md' color='gray.400'>({shortAddress(account.address)})</Text>
                                    </Tooltip>
                                    <CopyButton address={account.address} />
                                </HStack>
                                <Text fontSize='sm'>{account.notes.split('\n').join(', ')}</Text>
                                <Wrap>
                                    {account.tags.map(tag =>
                                        <WrapItem key={tag}>
                                            <Tag variant='outline' size='sm' key={tag}>{tag}</Tag>
                                        </WrapItem>
                                    )}
                                </Wrap>
                            </VStack>
                        </Link>
                    </Box>
                ))}
            </Flex>

        </VStack>
    )
}