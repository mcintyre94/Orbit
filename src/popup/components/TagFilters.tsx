import { UseCheckboxProps, useCheckbox, chakra, Tag, Box, CheckboxGroup, FormControl, FormLabel, Switch, VStack, Wrap, WrapItem, Input } from "@chakra-ui/react";
import { PropsWithChildren } from "react";
import { loader } from "../routes/Accounts";
import { FetcherWithComponents } from "react-router-dom";

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
    fetcher: FetcherWithComponents<unknown>;
}

export default function TagFilters({ tags, filtersEnabled, fetcher }: Props) {
    if (tags.length === 0) return null;

    return (
        <Box>
            <fetcher.Form action="/filtered-accounts">
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
                                fetcher.submit(event.currentTarget.form);
                            }}
                        />
                    </FormControl>
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