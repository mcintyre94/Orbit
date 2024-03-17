import type { Address } from "@solana/web3.js";
import { useCallback, useMemo } from "react"
import { makeConnectionSubmitEvent } from "../events";

type Props = {
    tabId: number,
    requestId: number,
    forOrigin: string,
}

interface FormElements extends HTMLFormControlsCollection {
    address1: HTMLInputElement
}

interface AddressFormElement extends HTMLFormElement {
    readonly elements: FormElements
}

export default function Connect({ tabId, requestId, forOrigin }: Props) {
    const decodedForOrigin = useMemo(() => decodeURIComponent(forOrigin), [forOrigin]);

    const onSubmit = useCallback(async (event: React.FormEvent<AddressFormElement>) => {
        event.preventDefault();
        // this is just temporary, no validation here
        const address = event.currentTarget.elements.address1.value as Address
        await chrome.runtime.sendMessage(makeConnectionSubmitEvent({
            tabId,
            requestId,
            forOrigin,
            addresses: [address]
        }))

        // if in panel, this will make sure if user opens it from action button
        // then it'll open the expected home page
        // TODO: doesn't seem to be working, idk why yet
        await chrome.sidePanel.setOptions({ path: 'index.html' });

        // close popup window, or hide sidebar panel
        window.close();
    }, [tabId, requestId]);

    return (
        <div>
            <h3>Connect to {decodedForOrigin}</h3>

            <form onSubmit={onSubmit}>
                <input type="text" name="address1" />
                <button type="submit">
                    Submit!
                </button>
            </form>
        </div>
    )
}