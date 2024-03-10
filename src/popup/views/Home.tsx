import { useEffect, useState } from "react";
import reactLogo from '../../assets/react.svg'
import { getSavedAddresses } from '../../addresses/storage';
import { SavedAddress } from "../../addresses/savedAddress";

const baseNewAddressUrl = 'index.html?view=newAddress';

export default function Home() {
    const [count, setCount] = useState(0);

    const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
    const [tags, setTags] = useState<Set<string>>(new Set());
    const [newAddressUrl, setNewAddressUrl] = useState<string>(baseNewAddressUrl);

    // get saved addresses on load
    useEffect(() => {
        const getStorage = async () => {
            const savedAddresses = await getSavedAddresses();
            setSavedAddresses(savedAddresses);
        }

        getStorage().catch(console.error);
    }, [])

    // update tags when saved addresses changes
    useEffect(() => {
        //const tags = new Set(...savedAddresses.flatMap(s => s.tags))
        const tags = new Set(['ledger', 'defi', 'jup']);
        setTags(tags);
    }, [savedAddresses]);

    // update new address URL when tags changes
    useEffect(() => {
        const searchParams = new URLSearchParams();
        tags.forEach((tag) => searchParams.append('tags', tag));

        const url = searchParams.size > 0 ? `${baseNewAddressUrl}&${searchParams.toString()}` : baseNewAddressUrl;
        setNewAddressUrl(url);
    }, [tags]);

    return (
        <>
            <div>
                <a href="https://vitejs.dev" target="_blank">
                    <img src="/vite.svg" className="logo" alt="Vite logo" />
                </a>
                <a href="https://reactjs.org" target="_blank">
                    <img src={reactLogo} className="logo react" alt="React logo" />
                </a>
            </div>
            <h1>Multiwallet</h1>
            <div>
                <p>{JSON.stringify(savedAddresses)}</p>
            </div>
            <div className="card">
                <a href={newAddressUrl}>Add new address</a>
            </div>
            <p className="read-the-docs">
                Click on the Vite and React logos to learn more
            </p>
        </>
    )
}