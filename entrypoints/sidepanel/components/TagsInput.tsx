import { TagsInput as MantineTagsInput } from "@mantine/core";
import { useCallback, useState } from "react";

interface TagsInputProps {
    allKnownTags: string[];
    initialTags: string[];
}

export default function TagsInput({ allKnownTags, initialTags }: TagsInputProps) {
    const [tags, setTags] = useState<string[]>(initialTags);
    const [hiddenValue, setHiddenValue] = useState<string>(JSON.stringify(initialTags));

    const handleChange = useCallback((newTags: string[]) => {
        // Filter out empty tags and trim whitespace
        const filteredTags = newTags
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0);
        setTags(filteredTags);
        setHiddenValue(JSON.stringify(filteredTags));
    }, []);

    return (
        <>
            {/* this is the input that actually gets passed to our action as tags values */}
            <input
                type='hidden'
                name='tagsInput'
                value={hiddenValue}
                onChange={() => { }} // empty onChange for controlled input
            />

            <MantineTagsInput
                label="Tags"
                placeholder="Add tags"
                data={allKnownTags}
                value={tags}
                onChange={handleChange}
                acceptValueOnBlur
                w="100%"
                styles={{
                    input: { background: 'transparent' },
                    pill: { backgroundColor: 'var(--mantine-color-blue-1)', color: 'var(--mantine-color-black)' },
                }}
            />
        </>
    )
}
