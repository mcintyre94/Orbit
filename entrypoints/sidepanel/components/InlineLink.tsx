import { Anchor } from "@mantine/core";
import { NavLink } from "react-router-dom";

export function InlineLink({ to, label }: { to: string, label: string }) {
    return (
        <NavLink to={to}>
            {({ isActive }) => (
                <Anchor
                    size="lg"
                    underline="never"
                    style={{
                        color: isActive ? 'var(--mantine-color-blue-2)' : 'var(--mantine-color-white)',
                        textDecoration: isActive ? 'underline' : undefined,
                    }}
                >
                    {label}
                </Anchor>
            )}
        </NavLink>
    )
}
