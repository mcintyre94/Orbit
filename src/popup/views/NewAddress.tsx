import { AddIcon, CloseIcon } from '@chakra-ui/icons';
import { Box, Button, FormControl, FormErrorMessage, FormHelperText, FormLabel, Heading, Input, Stack, Textarea, VStack, useColorMode, useToast } from '@chakra-ui/react'
import { AutoComplete, AutoCompleteInput, AutoCompleteTag, AutoCompleteList, AutoCompleteItem, AutoCompleteCreatable } from '@choc-ui/chakra-autocomplete';
import { isAddress } from '@solana/web3.js';
import { useCallback, useState } from 'react';
import { saveNewAddress } from '../../addresses/storage';
import { SavedAddress } from '../../addresses/savedAddress';

type Props = {
    tags: string[]
};

interface FormElements extends HTMLFormControlsCollection {
    addressInput: HTMLInputElement
    labelInput: HTMLInputElement
    notesInput: HTMLInputElement
}
interface AddressFormElement extends HTMLFormElement {
    readonly elements: FormElements
}

// TODO: refactor to fetch tags, instead of passing them like this
export default function NewAddress({ tags }: Props) {
    const [addressError, setAddressError] = useState(false);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    const saveAddress = useCallback(async (event: React.FormEvent<AddressFormElement>) => {
        event.preventDefault();

        const { elements } = event.currentTarget;

        const address = elements.addressInput.value;
        if (!isAddress(address)) return; // UI already shows an error here

        const label = elements.labelInput.value;
        const notes = elements.notesInput.value;

        console.log(selectedTags);

        const newAddress: SavedAddress = {
            address,
            label,
            notes,
            tags: selectedTags
        };

        try {
            await saveNewAddress(newAddress)
            window.location.replace('index.html');
        } catch (e) {
            // TODO: use toast
            console.error(e)
            alert(e)
        }
    }, [])

    const validateAddress = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const isValid = isAddress(e.currentTarget.value);
        setAddressError(!isValid);
    }, [])

    const cancel = useCallback(() => {
        window.location.replace('index.html');
    }, [])

    return (
        <Box>
            <VStack spacing={8}>
                <Heading as='h1' size='xl' noOfLines={1}>New Address</Heading>

                <form onSubmit={saveAddress} onReset={cancel}>
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

                        <FormControl id='tagsInput'>
                            <FormLabel optionalIndicator>Tags</FormLabel>
                            <AutoComplete openOnFocus multiple creatable onChange={(vals: string[]) => setSelectedTags(vals)}>
                                <AutoCompleteInput variant="filled" name='tagsInput'>
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

                        <Stack direction='row' spacing={4}>
                            <Button type='submit' leftIcon={<AddIcon />} colorScheme='blue' variant='solid' isDisabled={addressError}>
                                Save Address
                            </Button>
                            <Button type='reset' leftIcon={<CloseIcon />} colorScheme='red' variant='outline'>
                                Cancel
                            </Button>
                        </Stack>
                    </VStack>
                </form>
            </VStack>
        </Box>
    )
}
