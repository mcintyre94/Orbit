import { getAccount } from "@/accounts/storage";
import { Box, Button, ButtonGroup, Flex, Heading, HStack, IconButton, Image, Link, Skeleton, SkeletonCircle, SkeletonText, Spacer, Stack, Tag, Text, VStack, Wrap, WrapItem } from "@chakra-ui/react";
import { Address } from "@solana/addresses";
import React, { useCallback, useMemo } from "react";
import { Link as ReactRouterLink, LoaderFunctionArgs, useLoaderData, defer, Await, useNavigate } from "react-router-dom";
import { getTokensForAddress, TokenData } from "../utils/tokenData";
import { SavedAccount } from "@/accounts/savedAccount";
import { AddIcon, ArrowBackIcon, CheckCircleIcon, DeleteIcon, EditIcon, SearchIcon } from "@chakra-ui/icons";
import { formatDollars, formatNumber, formatPercent } from "../utils/numberFormatter";
import CopyButton from "../components/CopyButton";

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
        <VStack spacing={2} alignItems='stretch'>
            <ButtonGroup spacing={4}>
                <Button leftIcon={<ArrowBackIcon />} colorScheme='blue' variant='outline' onClick={handleBack}>
                    Back
                </Button>
                <ReactRouterLink to={`/accounts/${account.address}/edit`}>
                    <Button leftIcon={<EditIcon />} colorScheme='blue' variant='outline'>
                        Edit
                    </Button>
                </ReactRouterLink>
                <ReactRouterLink to={`https://explorer.solana.com/address/${account.address}`} target="_blank" rel="noopener noreferrer">
                    <Button leftIcon={<SearchIcon />} colorScheme='blue' variant='outline'>
                        Explorer
                    </Button>
                </ReactRouterLink>
            </ButtonGroup>

            <HStack spacing={2}>
                <Heading as='h1' size='xl' noOfLines={1}>{account.label}</Heading>
                <CopyButton address={account.address} />
            </HStack>


            <Text fontSize='sm' color='gray.400' wordBreak='break-all'>{account.address}</Text>

            <Heading as='h2' size='md' marginTop={4}>Notes</Heading>
            <Text whiteSpace='pre-wrap' fontSize='sm' color='gray.300' padding={2} borderRadius={2} borderStyle='solid' borderWidth={1}>{account.notes}</Text>

            <Heading as='h2' size='md' marginTop={4}>Tags</Heading>
            <Wrap>
                {account.tags.map(tag =>
                    <WrapItem key={tag}>
                        <Tag variant='outline' size='sm' key={tag}>{tag}</Tag>
                    </WrapItem>
                )}
            </Wrap>

            <Heading as='h2' size='md' marginTop={4}>Tokens</Heading>

            <React.Suspense fallback={
                <VStack width='100%' marginTop={1} spacing={4} alignItems='stretch'>
                    {[...Array(4)].map((_, idx) => (
                        <TokenDataSkeleton key={idx} />
                    ))}
                </VStack>
            }>
                <Await resolve={tokensData}>
                    {(data: TokenData[]) => (
                        <VStack width='100%' marginTop={1} spacing={0} alignItems='stretch'>
                            {data.map(token => (
                                <TokenDataDisplay key={token.mint} tokenData={token} />
                            ))}
                        </VStack>
                    )}
                </Await>
            </React.Suspense>
        </VStack>
    )
}

function TokenDataDisplay({ tokenData }: { tokenData: TokenData }) {
    console.log('Rendering token data', tokenData);

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
        <Box paddingX={4} marginX={-4} paddingY={4} _hover={{ backgroundColor: 'gray.700' }}>
            <Flex alignItems='center'>
                {tokenData.icon ? (
                    <Image src={tokenData.icon} alt={`${tokenData.name} icon`} boxSize='32px' borderRadius='full' marginRight={2} />
                ) : null}
                <Box>
                    <HStack spacing={2}>
                        <Text fontSize='sm' fontWeight='semibold'>{tokenData.name}</Text>
                        {tokenData.jupiterIsVerified ? <CheckCircleIcon color='green.500' /> : null}
                    </HStack>
                    <HStack spacing={1}>
                        <Text fontSize='sm' color='gray.400'>{usdPriceUnitFormatted}</Text>
                        {tokenData.priceChange24hPercent ? (
                            <Text fontSize='xs' color={tokenData.priceChange24hPercent >= 0 ? 'green.400' : 'red.400'}>({formatPercent(tokenData.priceChange24hPercent)})</Text>
                        ) : null}
                    </HStack>
                </Box>
                <Spacer />
                <Box textAlign='right'>
                    <Text fontSize='sm' fontWeight='semibold'>{usdValueFormatted}</Text>
                    <Text fontSize='sm' color='gray.400'>{tokenAmountFormatted} {tokenData.symbol}</Text>
                </Box>
            </Flex>
        </Box>
    )
}

function TokenDataSkeleton() {
    return (
        <HStack gap="5">
            <SkeletonCircle size="12" />
            <Stack flex="1">
                <Skeleton height="5" />
                <Skeleton height="5" />
            </Stack>
        </HStack>
    )
}
