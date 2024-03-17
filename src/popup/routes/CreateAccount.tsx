import { AddIcon } from '@chakra-ui/icons';
import { Box, Button, ButtonGroup, FormControl, FormErrorMessage, FormHelperText, FormLabel, Heading, Input, Spacer, Stack, Textarea, VStack, useColorMode, useToast } from '@chakra-ui/react'
import { AutoComplete, AutoCompleteInput, AutoCompleteTag, AutoCompleteList, AutoCompleteItem, AutoCompleteCreatable } from '@choc-ui/chakra-autocomplete';
import { isAddress } from '@solana/web3.js';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getTags, saveNewAccount } from '../../accounts/storage';
import { SavedAccount } from '../../accounts/savedAccount';
import { ActionFunctionArgs, Form, redirect, useActionData, useLoaderData, useNavigate } from 'react-router-dom';

type jsonString = string;

export async function loader() {
    const tags = await getTags();
    return { tags };
}

interface FormDataUpdates {
    addressInput: string;
    labelInput: string;
    notesInput: string;
    tagsInput: jsonString;
}

interface ActionData {
    error: string
}

export async function action({ request }: ActionFunctionArgs) {
    const formData = await request.formData();
    const updates = Object.fromEntries(formData) as unknown as FormDataUpdates;

    if (!isAddress(updates.addressInput)) {
        return { error: 'Invalid address' }
    }

    const newAccount: SavedAccount = {
        address: updates.addressInput,
        label: updates.labelInput,
        notes: updates.notesInput,
        tags: JSON.parse(updates.tagsInput),
    }

    try {
        await saveNewAccount(newAccount)
    } catch (e) {
        console.error('error saving account', e);
        if (e instanceof Error) {
            return { error: `Error saving account: ${e.message}` }
        } else {
            return { error: `Error saving account: ${e}` }
        }
    }

    return redirect('/index.html');
}

export default function CreateAccount() {
    const [addressError, setAddressError] = useState(false);
    const actionData = useActionData() as ActionData | undefined;
    const { tags } = useLoaderData() as Awaited<ReturnType<typeof loader>>;
    const tagsInputRef = useRef<HTMLInputElement | null>(null);
    const toast = useToast();
    const navigate = useNavigate();

    // Display error as toast if there is one
    useEffect(() => {
        if (actionData) {
            toast({
                title: actionData.error,
                status: 'error',
                isClosable: true,
            })
        }
    }, [actionData])

    const validateAddress = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const isValid = isAddress(e.currentTarget.value);
        setAddressError(!isValid);
    }, [])

    const cancel = useCallback(() => {
        navigate(-1);
    }, [])

    return (
        <Box marginTop={4}>
            <VStack spacing={8}>
                <Heading as='h1' size='xl' noOfLines={1}>Add New Account</Heading>

                <Form method='post' onReset={cancel}>
                    <VStack spacing={4}>
                        <FormControl isRequired isInvalid={addressError} id='addressInput'>
                            <FormLabel>Address</FormLabel>
                            <Input type='text' name='addressInput' onChange={validateAddress} />
                            <FormErrorMessage>Invalid address</FormErrorMessage>
                        </FormControl>

                        <FormControl isRequired id='labelInput'>
                            <FormLabel>Label</FormLabel>
                            <Input type='text' name='labelInput' />
                        </FormControl>

                        <FormControl id='notesInput'>
                            <FormLabel optionalIndicator>Notes</FormLabel>
                            <Textarea name='notesInput' />
                        </FormControl>

                        {/* this is the input that actually gets passed to our action as tags values */}
                        <FormControl hidden={true} aria-hidden={true}>
                            <Input type='hidden' name='tagsInput' ref={tagsInputRef} />
                        </FormControl>

                        <FormControl id='tagsInput'>
                            <FormLabel optionalIndicator>Tags</FormLabel>
                            <AutoComplete openOnFocus multiple creatable onChange={(vals: string[]) => {
                                // sync to the hidden input
                                if (tagsInputRef.current) {
                                    tagsInputRef.current.value = JSON.stringify(vals);
                                }
                            }}>
                                <AutoCompleteInput variant="filled" name='tagsInputUI'>
                                    {({ tags }) =>
                                        tags.map((tag, tid) => (
                                            <AutoCompleteTag
                                                key={tid}
                                                label={tag.label}
                                                onRemove={tag.onRemove}
                                                colorScheme='blue'
                                            />
                                        ))
                                    }
                                </AutoCompleteInput>
                                <AutoCompleteList>
                                    {tags.map((tag) => (
                                        <AutoCompleteItem
                                            key={tag}
                                            value={tag}
                                            _selected={{ bg: "whiteAlpha.50" }}
                                            _focus={{ bg: "whiteAlpha.100" }}
                                        >
                                            {tag}
                                        </AutoCompleteItem>
                                    ))}
                                    <AutoCompleteCreatable>
                                        {({ value }) => <span>Add {value} to List</span>}
                                    </AutoCompleteCreatable>
                                </AutoCompleteList>
                            </AutoComplete>
                        </FormControl>

                        <Spacer marginBottom={12} />

                        <ButtonGroup spacing={4}>
                            <Button type='submit' leftIcon={<AddIcon />} colorScheme='blue' variant='solid' isDisabled={addressError}>
                                Save Account
                            </Button>
                            <Button type='reset' colorScheme='red' variant='outline'>
                                Cancel
                            </Button>
                        </ButtonGroup>
                    </VStack>
                </Form>
            </VStack>
        </Box>
    )
}