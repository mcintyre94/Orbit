import { PropsWithChildren } from "react";
import { getSavedAddresses } from '../../addresses/storage';
import { shortAddress } from '../utils';
import { Form, Link, LoaderFunctionArgs, useLoaderData, useSubmit } from "react-router-dom";
import { Box, Button, CheckboxGroup, Flex, HStack, Tag, Text, UseCheckboxProps, VStack, Wrap, WrapItem, chakra, useCheckbox } from "@chakra-ui/react";

export async function loader({ request }: LoaderFunctionArgs) {
    const url = new URL(request.url);
    const previousTagCount = url.searchParams.get('previousTagCount') ?? 0
    let tagsInSearch = new Set(url.searchParams.getAll("tag"))

    const addresses = await getSavedAddresses();
    const tagNamesSet = new Set(addresses.flatMap(a => a.tags))
    const tagNames = [...tagNamesSet].sort();

    // default to all checked, unless the user has unselected them all
    if (tagsInSearch.size === 0 && previousTagCount === 0) {
        tagsInSearch = new Set(tagNames);
    }

    const tags = tagNames.map(tag => ({
        tagName: tag,
        selected: tagsInSearch.has(tag)
    }))

    const deselectedTags = new Set<string>();
    // set difference: tagNamesSet - tagsInSearch
    tagNamesSet.forEach(tagName => {
        if (!tagsInSearch.has(tagName)) {
            deselectedTags.add(tagName)
        }
    });

    // filter out any address with a deselected tag
    const filteredAddresses = addresses.filter(a => !a.tags.some(t => deselectedTags.has(t)));

    return { filteredAddresses, tags };
}

function TagCheckbox(props: PropsWithChildren<UseCheckboxProps>) {
    const { children } = props;
    const { state, getInputProps, htmlProps } = useCheckbox(props)

    return (
        <chakra.label
            cursor='pointer'
            {...htmlProps}
        >
            <>
                <input {...getInputProps()} hidden />
                <Tag colorScheme='blue' variant={state.isChecked ? 'solid' : 'outline'}>{children}</Tag>
            </>
        </chakra.label>
    )
}

export default function Home() {
    const { filteredAddresses, tags } = useLoaderData() as Awaited<ReturnType<typeof loader>>;
    const submit = useSubmit();

    return (
        <VStack spacing={8} alignItems='flex-start' maxHeight={4}>
            <Box alignSelf='center'>
                <Form>
                    <input name='previousTagCount' type='hidden' value={tags.length}></input>
                    <Wrap>
                        <CheckboxGroup colorScheme='blue'>
                            {tags.map(tag =>
                                <WrapItem key={tag.tagName}>
                                    <TagCheckbox
                                        key={tag.tagName}
                                        name='tag'
                                        value={tag.tagName}
                                        onChange={(event) => {
                                            submit(event.currentTarget.form);
                                        }}
                                        isChecked={tag.selected}
                                    >{tag.tagName}</TagCheckbox>
                                </WrapItem>
                            )}
                        </CheckboxGroup>
                    </Wrap>
                </Form>
            </Box>

            <Link to='/address'>
                <Button colorScheme='blue'>New Address</Button>
            </Link>

            <Flex direction='column' alignItems='flex-start' width='100%'>
                {filteredAddresses.map(address => (
                    <VStack padding={4} key={address.address} spacing={1} width='100%' alignItems='flex-start' _hover={{ backgroundColor: 'gray.700' }}>
                        <Text fontSize='md'>{address.label} <Text as='span' color='gray.400'>({shortAddress(address.address)})</Text></Text>
                        <Text fontSize='sm'>{address.notes.split('\n').join(', ')}</Text>
                        <Wrap>
                            {address.tags.map(tag =>
                                <WrapItem key={tag}>
                                    <Tag variant='outline' size='sm' key={tag}>{tag}</Tag>
                                </WrapItem>
                            )}
                        </Wrap>
                    </VStack>
                ))}
            </Flex>

        </VStack>
    )
}