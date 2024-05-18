import { deleteAccount } from '~/accounts/storage'
import { Address } from '@solana/addresses'
import { LoaderFunctionArgs, redirect } from 'react-router-dom';

interface Params {
    address: Address
}

export async function action({ params }: LoaderFunctionArgs) {
    const { address } = params as unknown as Params
    await deleteAccount(address);
    return redirect('/sidepanel.html');
}
