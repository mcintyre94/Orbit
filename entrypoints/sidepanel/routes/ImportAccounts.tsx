import { Outlet, NavLink } from "react-router-dom";
import { Button, Stack, Title, Group, Anchor } from "@mantine/core";
import { InlineLink } from "../components/InlineLink";

export default function ImportAccounts() {
    return (
        <Stack gap="lg">
            <Group>
                <NavLink to='/sidepanel.html'>
                    <Anchor component='button'>
                        <Button variant='outline'>
                            Back
                        </Button>
                    </Anchor>
                </NavLink>

                <Title order={2} lineClamp={1}>Import Accounts</Title>
            </Group>

            <Group gap="lg">
                <InlineLink to='addresses' label='Addresses' />
                <InlineLink to='accounts' label='Accounts' />
            </Group>

            <Outlet />
        </Stack>
    )
}
