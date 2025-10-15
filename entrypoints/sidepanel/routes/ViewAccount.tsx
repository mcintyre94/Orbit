import { getAccount } from "@/accounts/storage";
import { Box, Button, Group, Title, Stack, Skeleton, Flex, Text, Badge, Avatar } from "@mantine/core";
import { IconArrowLeft, IconEdit, IconSearch, IconCircleCheck, IconInnerShadowBottomRightFilled } from "@tabler/icons-react";
import { Address } from "@solana/addresses";
import React, { useCallback, useMemo } from "react";
import { Link as ReactRouterLink, LoaderFunctionArgs, useLoaderData, defer, Await, useNavigate } from "react-router-dom";
import { getTokensForAddress, TokenData } from "../utils/tokenData";
import { SavedAccount } from "@/accounts/savedAccount";
import { formatDollars, formatNumber, formatPercent } from "../utils/numberFormatter";
import CopyButton from "../components/CopyButton";
import classes from "../styles/HoverListItem.module.css"

interface Params {
    address: Address
}

type DeferredLoaderData = {
    account: SavedAccount;
    tokensData: Promise<TokenData[]>;
}

export async function loader({ params }: LoaderFunctionArgs) {
    const { address } = params as unknown as Params
    const account = await getAccount(address);
    const tokensData = getTokensForAddress(address);
    return defer({ account, tokensData } as DeferredLoaderData);
}

export default function ViewAccount() {
    const { account, tokensData } = useLoaderData() as DeferredLoaderData;
    const navigate = useNavigate();

    const handleBack = useCallback(() => {
        navigate(-1);
    }, [navigate]);

    return (
        <Stack gap="xs">
            <Group gap="md">
                <Button leftSection={<IconArrowLeft size={16} />} variant='outline' onClick={handleBack}>
                    Back
                </Button>
                <ReactRouterLink to={`/accounts/${account.address}/edit`}>
                    <Button leftSection={<IconEdit size={16} />} variant='outline'>
                        Edit
                    </Button>
                </ReactRouterLink>
                <ReactRouterLink to={`https://explorer.solana.com/address/${account.address}`} target="_blank" rel="noopener noreferrer">
                    <Button leftSection={<IconSearch size={16} />} variant='outline'>
                        Explorer
                    </Button>
                </ReactRouterLink>
            </Group>

            <Group gap="sm">
                <Title order={1} lineClamp={1}>{account.label}</Title>
                <CopyButton address={account.address} />
            </Group>

            <Text size="sm" c="gray.3" style={{ wordBreak: 'break-all' }}>{account.address}</Text>

            <Title order={2} size="h3" mt="md">Notes</Title>
            {account.notes.trim() !== '' ? (
                <Text
                    size="sm"
                    c="gray.2"
                    p="sm"
                    style={{
                        whiteSpace: 'pre-wrap',
                        border: '1px solid var(--mantine-color-default-border)',
                        borderRadius: 'var(--mantine-radius-default)'
                    }}
                >
                    {account.notes}
                </Text>
            ) : null}

            <Title order={2} size="h3" mt="md">Tags</Title>
            <Group gap="xs">
                {account.tags.map(tag =>
                    <Badge variant='outline' size='sm' key={tag}>{tag}</Badge>
                )}
            </Group>

            <Title order={2} size="h3" mt="md">Tokens</Title>

            <React.Suspense fallback={
                <Stack w="100%" mt="xs" gap="md">
                    {[...Array(4)].map((_, idx) => (
                        <TokenDataSkeleton key={idx} />
                    ))}
                </Stack>
            }>
                <Await resolve={tokensData}>
                    {(data: TokenData[]) => (
                        <Stack w="100%" gap={0}>
                            {data.map(token => (
                                <TokenDataDisplay key={token.mint} tokenData={token} />
                            ))}
                        </Stack>
                    )}
                </Await>
            </React.Suspense>
        </Stack>
    )
}

function TokenDataDisplay({ tokenData }: { tokenData: TokenData }) {
    const usdPriceUnitFormatted = useMemo(() => {
        return tokenData.usdPriceUnit ? formatDollars(tokenData.usdPriceUnit) : null;
    }, [tokenData.usdPriceUnit]);

    const usdValueFormatted = useMemo(() => {
        return tokenData.usdValue ? formatDollars(tokenData.usdValue) : null;
    }, [tokenData.usdValue]);

    const tokenAmountFormatted = useMemo(() => {
        return formatNumber(tokenData.amount, tokenData.decimals);
    }, [tokenData.amount, tokenData.decimals]);

    return (
        <Box className={classes.listitem}>
            <Flex align="center" justify="space-between">
                <Flex align="center" gap="sm">
                    {tokenData.icon ? (
                        <Avatar src={tokenData.icon} alt={`${tokenData.name} icon`} size={32} radius="xl">
                            <IconInnerShadowBottomRightFilled size={16} />
                        </Avatar>
                    ) : null}
                    <Box>
                        <Group gap="xs">
                            <Text size="sm" fw={600}>{tokenData.name}</Text>
                            {tokenData.jupiterIsVerified ? <IconCircleCheck size={16} color="var(--mantine-color-green-6)" /> : null}
                        </Group>
                        <Group gap="xs">
                            <Text size="sm" c="dimmed">{usdPriceUnitFormatted}</Text>
                            {tokenData.priceChange24hPercent ? (
                                <Text
                                    size="xs"
                                    c={tokenData.priceChange24hPercent >= 0 ? 'green' : 'red'}
                                >
                                    ({formatPercent(tokenData.priceChange24hPercent)})
                                </Text>
                            ) : null}
                        </Group>
                    </Box>
                </Flex>
                <Box style={{ textAlign: 'right' }}>
                    <Text size="sm" fw={600}>{usdValueFormatted}</Text>
                    <Text size="sm" c="dimmed">{tokenAmountFormatted} {tokenData.symbol}</Text>
                </Box>
            </Flex>
        </Box>
    )
}

function TokenDataSkeleton() {
    return (
        <Group gap="md">
            <Skeleton height={48} circle />
            <Stack flex="1" gap="xs">
                <Skeleton c="gray.5" height={20} />
                <Skeleton c="gray.5" height={20} />
            </Stack>
        </Group>
    )
}
