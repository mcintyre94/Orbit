import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import { Box, Button, ButtonGroup, FormControl, FormLabel, Heading, IconButton, Input, Spacer, Textarea, VStack, useToast } from '@chakra-ui/react'
import { type Address } from '@solana/web3.js';
import { useCallback, useEffect, useRef } from 'react';
import { getAccount, getTags, updateAccount } from '../../accounts/storage';
import { SavedAccount } from '../../accounts/savedAccount';
import { ActionFunctionArgs, Form, LoaderFunctionArgs, redirect, useActionData, useLoaderData, useNavigate } from 'react-router-dom';
import TagsInput from '../components/TagsInput';

type jsonString = string;

interface Params {
    address: Address
}

export async function loader({ params }: LoaderFunctionArgs) {
    const { address } = params as unknown as Params
    const account = await getAccount(address);
    const tags = await getTags();
    return { account, tags };
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

export async function action({ params, request }: ActionFunctionArgs) {
    const formData = await request.formData();
    const updates = Object.fromEntries(formData) as unknown as FormDataUpdates;
    const { address } = params as unknown as Params;

    const updatedAccount: SavedAccount = {
        address,
        label: updates.labelInput,
        notes: updates.notesInput,
        tags: JSON.parse(updates.tagsInput),
    }

    try {
        await updateAccount(updatedAccount);
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

export default function EditAccount() {
    const actionData = useActionData() as ActionData | undefined;
    const { account, tags } = useLoaderData() as Awaited<ReturnType<typeof loader>>;
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

    const cancel = useCallback(() => {
        navigate(-1);
    }, [])

    return (
        <Box marginTop={4}>
            <VStack spacing={8}>
                <Heading as='h1' size='xl' noOfLines={1}>Edit Account</Heading>

                <Form method='post' onReset={cancel}>
                    <VStack spacing={4}>
                        <FormControl isReadOnly isDisabled>
                            <FormLabel>Address</FormLabel>
                            <Input type='text' name='addressInput' value={account.address} />
                        </FormControl>

                        <FormControl isRequired id='labelInput'>
                            <FormLabel>Label</FormLabel>
                            <Input type='text' name='labelInput' defaultValue={account.label} />
                        </FormControl>

                        <FormControl id='notesInput'>
                            <FormLabel optionalIndicator>Notes</FormLabel>
                            <Textarea name='notesInput' defaultValue={account.notes} />
                        </FormControl>

                        <TagsInput allKnownTags={tags} initialTags={account.tags} tagsInputRef={tagsInputRef} />

                        <Spacer marginBottom={12} />

                        <ButtonGroup spacing={4}>
                            <Button type='submit' leftIcon={<AddIcon />} colorScheme='blue' variant='solid'>
                                Update Account
                            </Button>
                            <Button type='reset' colorScheme='red' variant='outline'>
                                Cancel
                            </Button>
                            {/* TODO: delete confirm + delete route */}
                            <IconButton aria-label='Delete account' colorScheme='red' variant='outline' icon={<DeleteIcon />}></IconButton>
                        </ButtonGroup>
                    </VStack>
                </Form>
            </VStack>
        </Box>
    )
}
