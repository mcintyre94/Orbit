import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import { AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Box, Button, ButtonGroup, FormControl, FormLabel, HStack, Heading, IconButton, Input, Spacer, Textarea, VStack, useDisclosure, useToast } from '@chakra-ui/react'
import { type Address } from '@solana/web3.js';
import { RefObject, useCallback, useEffect, useRef } from 'react';
import { getAccount, getTags, updateAccount } from '../../accounts/storage';
import { SavedAccount } from '../../accounts/savedAccount';
import { ActionFunctionArgs, Form, LoaderFunctionArgs, redirect, useActionData, useFetcher, useLoaderData, useNavigate } from 'react-router-dom';
import TagsInput from '../components/TagsInput';
import { shortAddress } from '../utils';

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

    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
    const cancelDeleteRef: RefObject<HTMLButtonElement> = useRef() as RefObject<HTMLButtonElement>;

    return (
        <>
            <Box marginTop={4}>
                <VStack spacing={8}>
                    <Heading as='h1' size='xl' noOfLines={1}>Edit Account</Heading>

                    <Form
                        onSubmit={(event) => {
                            event.preventDefault();
                            alert('gm');
                        }}
                        id='delete-confirm-form'
                    />

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
                                {/* delete button opens the delete confirm */}
                                <IconButton onClick={onDeleteOpen} aria-label='Delete account' colorScheme='red' variant='outline' icon={<DeleteIcon />}></IconButton>
                            </ButtonGroup>
                        </VStack>
                    </Form>
                </VStack>
            </Box>

            <AlertDialog
                isOpen={isDeleteOpen}
                leastDestructiveRef={cancelDeleteRef}
                onClose={onDeleteClose}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                            Delete Account?
                        </AlertDialogHeader>

                        <AlertDialogBody>Are you sure you want to delete <b>{account.label}</b> ({shortAddress(account.address)})?</AlertDialogBody>

                        <AlertDialogFooter>
                            <Form
                                method='post'
                                action={`/account/${account.address}/delete`}
                                onReset={onDeleteClose}
                            >
                                <ButtonGroup spacing={4}>
                                    <Button ref={cancelDeleteRef} type='reset'>Cancel</Button>
                                    <Button colorScheme='red' type='submit'>Delete</Button>
                                </ButtonGroup>
                            </Form>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </>
    )
}
