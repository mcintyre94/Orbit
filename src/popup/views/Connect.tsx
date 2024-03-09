import type { Address } from "@solana/web3.js";
import { useCallback } from "react"
import { makeConnectionSubmitEvent } from "../events";

type Props = {
    tabId: number,
    requestId: number,
}

interface FormElements extends HTMLFormControlsCollection {
    address1: HTMLInputElement
}

interface AddressFormElement extends HTMLFormElement {
    readonly elements: FormElements
}

export default function Connect({ tabId, requestId }: Props) {
    const onSubmit = useCallback(async (event: React.FormEvent<AddressFormElement>) => {
        event.preventDefault();
        // this is just temporary, no validation here
        const address = event.currentTarget.elements.address1.value as Address
        console.log({ address });
        await chrome.runtime.sendMessage(makeConnectionSubmitEvent(tabId, requestId, address))

        // if in panel, this will make sure if user opens it from action button
        // then it'll open the expected home page
        // TODO: doesn't seem to be working, idk why yet
        await chrome.sidePanel.setOptions({ path: 'index.html' });

        // close popup window, or hide sidebar panel
        window.close();
    }, [tabId, requestId]);

    return (
        <div>
            <form onSubmit={onSubmit}>
                <input type="text" name="address1" />
                <button type="submit">
                    Submit!
                </button>
            </form>
        </div>
    )
}