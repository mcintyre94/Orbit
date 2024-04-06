import { AddIcon } from '@chakra-ui/icons';
import { Button, ButtonGroup, FormControl, FormErrorMessage, FormLabel, Heading, Input, Spacer, Textarea, VStack, useToast } from '@chakra-ui/react'
import { isAddress } from '@solana/web3.js';
import { useCallback, useEffect, useRef, useState } from 'react';
import { saveNewAccount } from '../../accounts/storage';
import { SavedAccount } from '../../accounts/savedAccount';
import { ActionFunctionArgs, Form, redirect, useActionData, useNavigate, useRouteLoaderData } from 'react-router-dom';
import TagsInput from '../components/TagsInput';
import { FilteredAccountsLoaderData } from './FilteredAccounts';

type jsonString = string;

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
    const { tags } = useRouteLoaderData('accounts-route') as FilteredAccountsLoaderData;
    const tagNames = tags.map(t => t.tagName);
    const tagsInputRef = useRef<HTMLInputElement | null>(null);
    const toast = useToast();
    const navigate = useNavigate();

    // Display error as toast if there is one
    useEffect(() => {
        if (actionData) {
            toast({
                title: 'Error creating account',
                description: actionData.error,
                status: 'error',
                duration: 10_000,
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

                    <TagsInput allKnownTags={tagNames} initialTags={[]} tagsInputRef={tagsInputRef} />

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
    )
}
