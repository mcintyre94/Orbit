import { UseCheckboxProps, useCheckbox, chakra, Tag, Box, CheckboxGroup, FormControl, FormLabel, Switch, VStack, Wrap, WrapItem, Input, HStack, InputGroup, InputLeftElement, ResponsiveValue } from "@chakra-ui/react";
import { PropsWithChildren } from "react";
import { loader } from "../routes/Accounts";
import { FetcherWithComponents } from "react-router-dom";
import { SearchIcon } from "@chakra-ui/icons";

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

interface Props {
    tags: Awaited<ReturnType<typeof loader>>['tags'];
    filtersEnabled: boolean;
    searchQuery: string;
    fetcher: FetcherWithComponents<unknown>;
}

export default function TagFilters({ tags, filtersEnabled, searchQuery, fetcher }: Props) {
    if (tags.length === 0) return null;

    return (
        <Box>
            <fetcher.Form action="/filtered-accounts">
                <VStack spacing={4} alignItems='flex-start'>
                    <HStack spacing={2}>
                        <FormControl display='flex' alignItems='center'>
                            <FormLabel htmlFor='enableFilters' mb='0'>
                                Enable tag filtering
                            </FormLabel>
                            <Switch
                                name='enableFilters'
                                id='enableFilters'
                                value='enabled'
                                defaultChecked={filtersEnabled}
                                onChange={(event) => {
                                    fetcher.submit(event.currentTarget.form);
                                }}
                            />
                        </FormControl>

                        <InputGroup>
                            <InputLeftElement pointerEvents='none'>
                                <SearchIcon />
                            </InputLeftElement>
                            <Input
                                type='search'
                                placeholder='Search accounts'
                                name='search'
                                rounded={8}
                                defaultValue={searchQuery}
                                role='search'
                                aria-label='Search accounts'
                                onChange={(event) => {
                                    fetcher.submit(event.currentTarget.form);
                                }}
                                _placeholder={{ color: 'gray.500' }}
                                borderColor='gray.400'
                                autoComplete='off'
                            />
                        </InputGroup>
                    </HStack>
                    {filtersEnabled ?
                        <Wrap alignSelf='center'>
                            <CheckboxGroup colorScheme='blue'>
                                {tags.map(tag =>
                                    <WrapItem key={tag.tagName}>
                                        <TagCheckbox
                                            name='tag'
                                            value={tag.tagName}
                                            onChange={(event) => {
                                                fetcher.submit(event.currentTarget.form);
                                            }}
                                            isChecked={tag.selected}
                                            isDisabled={!filtersEnabled}
                                        >{tag.tagName}</TagCheckbox>
                                    </WrapItem>
                                )}
                            </CheckboxGroup>
                        </Wrap>
                        : null
                    }
                </VStack>
            </fetcher.Form>
        </Box>
    )
}