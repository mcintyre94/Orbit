import { UseCheckboxProps, useCheckbox, chakra, Tag, Box, CheckboxGroup, FormControl, FormLabel, Switch, VStack, Wrap, WrapItem, Input } from "@chakra-ui/react";
import { PropsWithChildren } from "react";
import { loader } from "../routes/Home";
import { Form, SubmitFunction } from "react-router-dom";

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
    submit: SubmitFunction;
    additionalSearchParams?: Record<string, string>
}

export default function TagFilters({ tags, filtersEnabled, submit, additionalSearchParams }: Props) {
    if (tags.length === 0) return null;

    return (
        <Box>
            <Form>
                <VStack spacing={2}>
                    {Object.entries(additionalSearchParams ?? {}).map(([name, value]) => (
                        <FormControl hidden={true} aria-hidden={true}>
                            <Input type='hidden' name={name} value={value} />
                        </FormControl>
                    ))}
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
                    {filtersEnabled ?
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
                        : null
                    }
                </VStack>
            </Form>
        </Box>
    )
}