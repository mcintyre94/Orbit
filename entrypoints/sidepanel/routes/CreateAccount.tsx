import { AddIcon } from '@chakra-ui/icons';
import { Button, ButtonGroup, FormControl, FormErrorMessage, FormLabel, Heading, Input, Spacer, Textarea, VStack, useToast } from '@chakra-ui/react'
import { Address, isAddress } from '@solana/addresses';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { saveNewAccount } from '~/accounts/storage';
import { SavedAccount } from '~/accounts/savedAccount';
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

    return redirect('/sidepanel.html');
}

export default function CreateAccount() {
    const actionData = useActionData() as ActionData | undefined;
    const { accounts, tags } = useRouteLoaderData('accounts-route') as FilteredAccountsLoaderData;
    const accountAddresses = useMemo(() => {
        return new Set(accounts.map(a => a.address))
    }, [accounts]);
    const accountLabels = useMemo(() => {
        return new Set(accounts.map(a => a.label))
    }, [accounts]);

    const tagNames = tags.map(t => t.tagName);
    const tagsInputRef = useRef<HTMLInputElement | null>(null);

    const toast = useToast();
    const navigate = useNavigate();

    const [addressError, setAddressError] = useState<string | undefined>(undefined);
    const [labelError, setLabelError] = useState<string | undefined>(undefined);

    const [addressInputValue, setAddressInputValue] = useState('')
    const [labelInputValue, setLabelInputValue] = useState('')

    const [isSubmitDisabled, setIsSubmitDisabled] = useState(true)

    useMemo(() => {
        setIsSubmitDisabled(
            addressError !== undefined ||
            labelError !== undefined ||
            addressInputValue.length === 0 ||
            labelInputValue.length === 0
        )
    }, [addressError, labelError, addressInputValue, labelInputValue])

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
        const newMaybeAddress = e.currentTarget.value;
        setAddressInputValue(newMaybeAddress);

        // clear error when empty
        if (newMaybeAddress.length === 0) {
            setAddressError(undefined)
            return;
        }

        // flag invalid address
        if (!isAddress(newMaybeAddress)) {
            setAddressError('Invalid address');
            return;
        }

        // flag address that alreaedy exists
        if (accountAddresses.has(newMaybeAddress as Address)) {
            setAddressError('Address already exists')
            return;
        }

        setAddressError(undefined);
    }, [accountAddresses])

    const validateLabel = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newLabel = e.currentTarget.value;
        setLabelInputValue(newLabel);
        if (accountLabels.has(newLabel)) {
            setLabelError('Label already exists')
        } else {
            setLabelError(undefined)
        }
    }, [accountLabels])

    const cancel = useCallback(() => {
        navigate(-1);
    }, [])

    return (
        <VStack spacing={8}>
            <Heading as='h1' size='xl' noOfLines={1}>Add New Account</Heading>

            <Form method='post' onReset={cancel}>
                <VStack spacing={4}>
                    <FormControl isRequired isInvalid={addressError !== undefined} id='addressInput'>
                        <FormLabel>Address</FormLabel>
                        <Input type='text' name='addressInput' onChange={validateAddress} />
                        <FormErrorMessage>{addressError}</FormErrorMessage>
                    </FormControl>

                    <FormControl isRequired isInvalid={labelError !== undefined} id='labelInput'>
                        <FormLabel>Label</FormLabel>
                        <Input type='text' name='labelInput' onChange={validateLabel} />
                        <FormErrorMessage>{labelError}</FormErrorMessage>
                    </FormControl>

                    <FormControl id='notesInput'>
                        <FormLabel optionalIndicator>Notes</FormLabel>
                        <Textarea name='notesInput' />
                    </FormControl>

                    <TagsInput allKnownTags={tagNames} initialTags={[]} tagsInputRef={tagsInputRef} />

                    <Spacer marginBottom={12} />

                    <ButtonGroup spacing={4}>
                        <Button type='submit' title={addressError ?? labelError} leftIcon={<AddIcon />} colorScheme='blue' variant='solid' isDisabled={isSubmitDisabled}>
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
