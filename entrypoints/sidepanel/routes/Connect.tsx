import type { Address } from "@solana/addresses";
import { makeConnectionSubmitEvent } from "../events";
import {
  ActionFunctionArgs,
  FetcherWithComponents,
  Form,
  LoaderFunctionArgs,
  useFetcher,
  useLoaderData,
  useRouteLoaderData,
} from "react-router-dom";
import { Box, Button, Group, Stack, Title } from "@mantine/core";
import AccountDisplay from "../components/AccountDisplay";
import TagFilters from "../components/TagFilters";
import { getFilteredAccountsData } from "../utils/filterAccounts";
import { FilteredAccountsLoaderData } from "./FilteredAccounts";
import { SavedAccount } from "../../../accounts/savedAccount";
import { useCallback, useMemo, useState } from "react";
import { getSavedConnection } from "@/connections/storage";

type SidePanel = {
  setOptions({
    path,
    enabled,
  }: {
    path: string;
    enabled?: boolean;
  }): Promise<void>;
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { searchParams } = new URL(request.url);

  const tabIdString = searchParams.get("tabId");
  if (!tabIdString)
    throw new Error("tabId query param is required for connect");
  const tabId = Number(tabIdString);
  if (Number.isNaN(tabId))
    throw new Error(`tabId query param should be a number, got ${tabIdString}`);

  const requestIdString = searchParams.get("requestId");
  if (!requestIdString)
    throw new Error("requestId query param is required for connect");
  const requestId = Number(requestIdString);
  if (Number.isNaN(requestId))
    throw new Error(`requestId should be a number, got ${requestIdString}`);

  const encodedForOrigin = searchParams.get("forOrigin");
  if (!encodedForOrigin)
    throw new Error("forOrigin query param is required for connect");
  const forOrigin = decodeURIComponent(encodedForOrigin);

  const connectedAddressesForOrigin =
    (await getSavedConnection(forOrigin)) ?? [];

  return { tabId, requestId, forOrigin, connectedAddressesForOrigin };
}

interface FormDataUpdates {
  tabIdInput: string;
  requestIdInput: string;
  forOriginInput: string;
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const updates = Object.fromEntries(formData) as unknown as FormDataUpdates;

  const tabId = Number(updates.tabIdInput);
  const requestId = Number(updates.requestIdInput);
  const forOrigin = updates.forOriginInput;

  // Object.fromEntries doesn't get all for checkboxes
  const addresses = formData.getAll("addressInput") as Address[];

  await sendAndClose(tabId, requestId, forOrigin, addresses);
}

async function sendAndClose(
  tabId: number,
  requestId: number,
  forOrigin: string,
  addresses: Address[]
) {
  await browser.runtime.sendMessage(
    makeConnectionSubmitEvent({
      tabId,
      requestId,
      forOrigin,
      addresses,
    })
  );

  // if in panel, this will make sure if user opens it from action button
  // then it'll open the expected home page
  const sidePanel = (browser as { sidePanel?: unknown })
    .sidePanel as unknown as SidePanel;

  await sidePanel.setOptions({ path: "sidepanel.html" });

  // close popup window, or hide sidebar panel
  window.close();
}

function AccountAsCheckbox({
  value,
  checked,
  onChange,
  children
}: {
  value: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <label style={{ cursor: 'pointer', display: 'block' }}>
      <input
        type="checkbox"
        name="addressInput"
        value={value}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        hidden
      />
      {children}
    </label>
  );
}

type AccountsListProps = {
  allAccounts: SavedAccount[];
  filteredAddresses: Set<Address>;
  selectedAddresses: Address[];
  onToggle: (address: Address) => void;
};

function AccountsList({
  allAccounts,
  filteredAddresses,
  selectedAddresses,
  onToggle,
}: AccountsListProps) {
  const selectedSet = useMemo(() => new Set(selectedAddresses), [selectedAddresses]);

  return (
    <Stack gap="xxs">
      {allAccounts.map((account) => {
        const isChecked = selectedSet.has(account.address);

        if (!filteredAddresses.has(account.address)) {
          // If an address is filtered out but is checked, render a hidden input with its address
          // This ensures that we connect all checked accounts, not just visible ones
          if (isChecked) {
            return (
              <input
                key={account.address}
                type="hidden"
                name="addressInput"
                value={account.address}
              />
            );
          } else {
            return null;
          }
        }

        return (
          <AccountAsCheckbox
            key={account.address}
            value={account.address}
            checked={isChecked}
            onChange={() => onToggle(account.address)}
          >
            <AccountDisplay account={account} isSelected={isChecked} />
          </AccountAsCheckbox>
        );
      })}
    </Stack>
  );
}

type SelectDeselectAllProps = {
  allAddresses: Address[];
  filteredAddresses: Set<Address>;
  setSelectedAddresses: React.Dispatch<React.SetStateAction<Address[]>>;
};

function SelectDeselectAll({
  allAddresses,
  filteredAddresses,
  setSelectedAddresses,
}: SelectDeselectAllProps) {
  // Note: not the same as filtersEnabled, we want to treat as filtered if search is being used
  const filtered = allAddresses.length !== filteredAddresses.size;

  const selectAll = useCallback(() => {
    if (filtered) {
      // add all filtered addresses to the current selection
      return setSelectedAddresses((currentAddresses: Address[]) =>
        currentAddresses.concat([...filteredAddresses])
      );
    } else {
      // no filters, just select all addresses
      return setSelectedAddresses(allAddresses);
    }
  }, [allAddresses, filteredAddresses, filtered, setSelectedAddresses]);

  const deselectAll = useCallback(() => {
    if (filtered) {
      // remove all filtered addresses from the current selection
      return setSelectedAddresses((currentAddresses: Address[]) =>
        currentAddresses.filter(
          (address: Address) => !filteredAddresses.has(address)
        )
      );
    } else {
      // no filters, just deselect all addresses
      return setSelectedAddresses([]);
    }
  }, [allAddresses, filteredAddresses, filtered, setSelectedAddresses]);

  return (
    <Group gap="md">
      <Button size="sm" variant="subtle" onClick={selectAll}>
        Select all
      </Button>

      <Button
        size="sm"
        variant="subtle"
        onClick={deselectAll}
      >
        Deselect all
      </Button>
    </Group>
  );
}

export default function Connect() {
  const loaderData = useLoaderData() as Awaited<ReturnType<typeof loader>>;
  const { tabId, requestId, forOrigin, connectedAddressesForOrigin } =
    loaderData;
  const filtersFetcher =
    useFetcher() as FetcherWithComponents<FilteredAccountsLoaderData>;
  const routeLoaderData = useRouteLoaderData(
    "accounts-route"
  ) as FilteredAccountsLoaderData;
  const { accounts: allAccounts } = routeLoaderData;
  const allAddresses = useMemo(
    () => allAccounts.map((account) => account.address),
    [allAccounts]
  );
  const {
    accounts: filteredAccounts,
    tags,
    filtersEnabled,
    searchQuery,
  } = getFilteredAccountsData(routeLoaderData, filtersFetcher.data);
  const filteredAddresses = useMemo(
    () => new Set(filteredAccounts.map((account) => account.address)),
    [filteredAccounts]
  );

  const [selectedAddresses, setSelectedAddresses] = useState<Address[]>(
    connectedAddressesForOrigin
  );

  const handleToggle = useCallback((address: Address) => {
    setSelectedAddresses(prev =>
      prev.includes(address)
        ? prev.filter(a => a !== address)
        : [...prev, address]
    );
  }, []);

  return (
    <Stack gap="lg" align="flex-start">
      <Title order={3}>
        Connect to {forOrigin}
      </Title>

      <TagFilters
        tags={tags}
        filtersEnabled={filtersEnabled}
        searchQuery={searchQuery}
        fetcher={filtersFetcher}
      />

      {filteredAddresses.size > 0 ? (
        <SelectDeselectAll
          allAddresses={allAddresses}
          filteredAddresses={filteredAddresses}
          setSelectedAddresses={setSelectedAddresses}
        />
      ) : null}

      <Box w="100%" mb="xs">
        <Form
          method="post"
          id="accounts-form"
          onReset={() => sendAndClose(tabId, requestId, forOrigin, [])}
        >
          <input type="hidden" name="tabIdInput" value={tabId} />
          <input type="hidden" name="requestIdInput" value={requestId} />
          <input type="hidden" name="forOriginInput" value={forOrigin} />
          <AccountsList
            allAccounts={allAccounts}
            filteredAddresses={filteredAddresses}
            selectedAddresses={selectedAddresses}
            onToggle={handleToggle}
          />
        </Form>
      </Box>

      <Box maw="48em" style={{ position: "sticky", bottom: "1em" }}>
        <Group justify="center" gap="lg">
          <Button
            form="accounts-form"
            type="submit"
            disabled={selectedAddresses.length === 0}
            size="md"
            autoContrast
          >
            Connect {selectedAddresses.length}{" "}
            {selectedAddresses.length === 1 ? "Account" : "Accounts"}
          </Button>
          <Button
            form="accounts-form"
            type="reset"
            variant="outline"
            size="md"
          >
            Cancel
          </Button>
        </Group>
      </Box>
    </Stack>
  );
}
