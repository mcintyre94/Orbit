import { Button, Group, TextInput, Title, Stack, Textarea, Space } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconPlus } from '@tabler/icons-react';
import { Address, isAddress } from '@solana/addresses';
import { useCallback, useEffect, useMemo, useState } from 'react';
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

    // Display error notification if there is one
    useEffect(() => {
        if (actionData) {
            notifications.show({
                title: 'Error creating account',
                message: actionData.error,
                color: 'red',
                autoClose: 10_000,
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
        <Stack gap="lg">
            <Title order={1} lineClamp={1}>Add New Account</Title>

            <Form method='post' onReset={cancel}>
                <Stack gap="md">
                    <TextInput
                        label="Address"
                        name="addressInput"
                        type="text"
                        onChange={validateAddress}
                        error={addressError}
                        required
                        withAsterisk
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
                        onChange={validateLabel}
                        error={labelError}
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
                        minRows={3}
                        resize="vertical"
                        autosize
                        styles={{
                            input: {
                                backgroundColor: 'transparent'
                            }
                        }}
                    />

                    <TagsInput allKnownTags={tagNames} initialTags={[]} />

                    <Space h="md" />

                    <Group gap="md">
                        <Button
                            type='submit'
                            variant='filled'
                            title={addressError ?? labelError}
                            leftSection={<IconPlus size={16} />}
                            autoContrast
                            disabled={isSubmitDisabled}
                        >
                            Save Account
                        </Button>
                        <Button type='reset' variant='outline'>
                            Cancel
                        </Button>
                    </Group>
                </Stack>
            </Form>
        </Stack>
    )
}
