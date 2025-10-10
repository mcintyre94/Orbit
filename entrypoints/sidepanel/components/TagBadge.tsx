import { Badge, DefaultMantineColor } from "@mantine/core"

type TagBadgeProps = {
    color: DefaultMantineColor;
    isFilled: boolean;
    isDisabled: boolean;
    children: React.ReactNode;
}

export default function TagBadge({ color, isFilled, isDisabled, children }: TagBadgeProps) {
    return (
        <Badge
            autoContrast
            radius="sm"
            color={color}
            variant={isFilled ? 'filled' : 'outline'}
            style={{ cursor: isDisabled ? 'not-allowed' : 'pointer' }}
            styles={(theme) => ({
                root: {
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    textTransform: 'none',
                    padding: theme.spacing.xs,
                }
            })}
        >
            {children}
        </Badge>
    )
}