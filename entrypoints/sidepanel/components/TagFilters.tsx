import { Box, Switch, Stack, Group, TextInput } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { PropsWithChildren } from "react";
import { loader } from "../routes/Accounts";
import { FetcherWithComponents } from "react-router-dom";
import TagBadge from "./TagBadge";

interface TagCheckboxProps {
    name: string;
    value: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    isChecked: boolean;
    isDisabled: boolean;
}

function TagCheckbox({ name, value, onChange, isChecked, isDisabled, children }: PropsWithChildren<TagCheckboxProps>) {
    return (
        <label style={{ cursor: isDisabled ? 'not-allowed' : 'pointer' }}>
            <input
                type="checkbox"
                name={name}
                value={value}
                onChange={onChange}
                checked={isChecked}
                disabled={isDisabled}
                hidden
            />
            <TagBadge isDisabled={isDisabled} isFilled={isChecked} color="blue.2" >
                {children}
            </TagBadge>
        </label>
    )
}

interface Props {
    tags: Awaited<ReturnType<typeof loader>>['tags'];
    filtersEnabled: boolean;
    searchQuery: string;
    fetcher: FetcherWithComponents<unknown>;
}

export default function TagFilters({ tags, filtersEnabled, searchQuery, fetcher }: Props) {
    if (tags.length === 0) return null;

    return (
        <Box>
            <fetcher.Form action="/filtered-accounts">
                <Stack gap="md" align="flex-start">
                    <Group gap="sm" align="center" wrap="nowrap" style={{ width: '100%' }}>
                        <Switch
                            withThumbIndicator={false}
                            labelPosition="left"
                            label="Enable tag filtering"
                            size="md"
                            name='enableFilters'
                            id='enableFilters'
                            value='enabled'
                            defaultChecked={filtersEnabled}
                            color="blue.5"
                            styles={{
                                label: { whiteSpace: 'pre-wrap', maxWidth: '120px' },
                                body: { alignItems: 'center' },
                            }}
                            onChange={(event) => {
                                fetcher.submit(event.currentTarget.form);
                            }}
                        />

                        <TextInput
                            type='search'
                            placeholder='Search'
                            name='search'
                            defaultValue={searchQuery}
                            role='search'
                            aria-label='Search accounts'
                            onChange={(event) => {
                                fetcher.submit(event.currentTarget.form);
                            }}
                            leftSection={<IconSearch size={16} />}
                            radius="md"
                            autoComplete='off'
                            variant="default"
                            styles={{
                                input: { background: 'transparent' }
                            }}
                        />
                    </Group>
                    {filtersEnabled ?
                        <Group gap="xs">
                            {tags.map(tag =>
                                <TagCheckbox
                                    key={tag.tagName}
                                    name='tag'
                                    value={tag.tagName}
                                    onChange={(event) => {
                                        fetcher.submit(event.currentTarget.form);
                                    }}
                                    isChecked={tag.selected}
                                    isDisabled={!filtersEnabled}
                                >{tag.tagName}</TagCheckbox>
                            )}
                        </Group>
                        : null
                    }
                </Stack>
            </fetcher.Form>
        </Box>
    )
}