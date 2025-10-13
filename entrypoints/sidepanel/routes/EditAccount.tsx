import { Button, Group, TextInput, Title, Stack, Textarea, Space, Modal, Text, ActionIcon } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useDisclosure } from '@mantine/hooks';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { type Address } from '@solana/addresses';
import { useCallback, useEffect } from 'react';
import { getAccount, updateAccount } from '../../../accounts/storage';
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
    const navigate = useNavigate();

    const [isDeleteOpen, { open: openDelete, close: closeDelete }] = useDisclosure(false);

    // Display error notification if there is one
    useEffect(() => {
        if (actionData) {
            notifications.show({
                title: 'Error updating account',
                message: actionData.error,
                color: 'red',
                autoClose: 10_000,
            })
        }
    }, [actionData])

    const cancel = useCallback(() => {
        navigate(-1);
    }, [])

    return (
        <Stack gap="lg">
            <Title order={1} lineClamp={1}>Edit Account</Title>

            <Form method='post' onReset={cancel}>
                <Stack gap="md">
                    <TextInput
                        label="Address"
                        name="addressInput"
                        type="text"
                        value={account.address}
                        readOnly
                        disabled
                        styles={{
                            input: {
                                backgroundColor: 'transparent'
                            }
                        }}
                    />

                    <TextInput
                        label="Label"
                        name="labelInput"
                        type="text"
                        defaultValue={account.label}
                        required
                        withAsterisk
                        styles={{
                            input: {
                                backgroundColor: 'transparent'
                            }
                        }}
                    />

                    <Textarea
                        label="Notes"
                        name="notesInput"
                        defaultValue={account.notes}
                        minRows={3}
                        resize="vertical"
                        autosize
                        styles={{
                            input: {
                                backgroundColor: 'transparent'
                            }
                        }}
                    />

                    <TagsInput allKnownTags={tagNames} initialTags={account.tags} />

                    <Space h="md" />

                    <Group gap="md">
                        <Button
                            type='submit'
                            variant='filled'
                            leftSection={<IconEdit size={16} />}
                            autoContrast
                        >
                            Update Account
                        </Button>
                        <Button type='reset' variant='outline'>
                            Cancel
                        </Button>
                        <ActionIcon
                            onClick={openDelete}
                            aria-label='Delete account'
                            variant='outline'
                            color='red.2'
                            size="lg"
                        >
                            <IconTrash size={16} />
                        </ActionIcon>
                    </Group>
                </Stack>
            </Form>

            <Modal opened={isDeleteOpen} onClose={closeDelete} title="Delete Account?" centered>
                <Stack gap="md">
                    <Text>
                        Are you sure you want to delete <strong>{account.label}</strong> ({shortAddress(account.address)})?
                    </Text>

                    <Form
                        method='post'
                        action={`/accounts/${account.address}/delete`}
                        onReset={closeDelete}
                    >
                        <Group gap="md">
                            <Button type='reset' variant='outline' autoContrast>Cancel</Button>
                            <Button type='submit' color='red.2' autoContrast>Delete</Button>
                        </Group>
                    </Form>
                </Stack>
            </Modal>
        </Stack>
    )
}
