import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import { AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Box, Button, ButtonGroup, Flex, FormControl, FormLabel, Heading, IconButton, Input, Spacer, Textarea, VStack, useDisclosure, useToast } from '@chakra-ui/react'
import { type Address } from '@solana/addresses';
import { RefObject, useCallback, useEffect, useRef } from 'react';
import { getAccount, getTags, updateAccount } from '../../../accounts/storage';
import { SavedAccount } from '~/accounts/savedAccount';
import { ActionFunctionArgs, Form, LoaderFunctionArgs, redirect, useActionData, useLoaderData, useNavigate, useRouteLoaderData } from 'react-router-dom';
import TagsInput from '../components/TagsInput';
import { shortAddress } from '../utils/address';
import { FilteredAccountsLoaderData } from './FilteredAccounts';

type jsonString = string;

interface Params {
    address: Address
}

export async function loader({ params }: LoaderFunctionArgs) {
    const { address } = params as unknown as Params
    const account = await getAccount(address);
    return { account };
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

    return redirect('/sidepanel.html');
}

export default function EditAccount() {
    const actionData = useActionData() as ActionData | undefined;
    const { account } = useLoaderData() as Awaited<ReturnType<typeof loader>>;
    const { tags } = useRouteLoaderData('accounts-route') as FilteredAccountsLoaderData;
    const tagNames = tags.map(t => t.tagName);
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
        <Flex direction='column' minHeight='100vh'>
            <>
                <VStack spacing={8}>
                    <Heading as='h1' size='xl' noOfLines={1}>Edit Account</Heading>

                    <Box width='100%' maxWidth={400}>
                        <Form method='post' onReset={cancel} id='editForm'>
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

                                <TagsInput allKnownTags={tagNames} initialTags={account.tags} tagsInputRef={tagsInputRef} />
                            </VStack>
                        </Form>
                    </Box>
                </VStack>

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
                                    action={`/accounts/${account.address}/delete`}
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
            <Spacer />
            <Box marginBottom={8}>
                <ButtonGroup spacing={4}>
                    <Button form='editForm' type='submit' leftIcon={<AddIcon />} colorScheme='blue' variant='solid'>
                        Update Account
                    </Button>
                    <Button form='editForm' type='reset' colorScheme='red' variant='outline'>
                        Cancel
                    </Button>
                    {/* delete button opens the delete confirm */}
                    <IconButton onClick={onDeleteOpen} aria-label='Delete account' colorScheme='red' variant='outline' icon={<DeleteIcon />}></IconButton>
                </ButtonGroup>
            </Box>
        </Flex >
    )
}
