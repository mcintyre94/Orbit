import { FormControl, FormLabel, Input } from "@chakra-ui/react";
import { AutoComplete, AutoCompleteCreatable, AutoCompleteInput, AutoCompleteItem, AutoCompleteList, AutoCompleteTag } from "@choc-ui/chakra-autocomplete";

interface TagsInputProps {
    allKnownTags: string[];
    initialTags: string[];
    tagsInputRef: React.MutableRefObject<HTMLInputElement | null>;
}

export default function TagsInput({ allKnownTags, initialTags, tagsInputRef }: TagsInputProps) {
    return (
        <>
            {/* this is the input that actually gets passed to our action as tags values */}
            <FormControl hidden={true} aria-hidden={true}>
                <Input type='hidden' name='tagsInput' ref={tagsInputRef} defaultValue={JSON.stringify(initialTags)} />
            </FormControl>

            <FormControl id='tagsInput'>
                <FormLabel>Tags</FormLabel>
                <AutoComplete openOnFocus multiple creatable defaultValues={initialTags} onChange={(vals: string[]) => {
                    // sync to the hidden input
                    if (tagsInputRef.current) {
                        tagsInputRef.current.value = JSON.stringify(vals);
                    }
                }}>
                    <AutoCompleteInput variant="filled" name='tagsInputUI' autoComplete="off" type="search">
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
                        {allKnownTags.map((tag) => (
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
        </>
    )
}
