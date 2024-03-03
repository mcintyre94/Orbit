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