import { Stack, Textarea, Button } from "@mantine/core";
import { ActionFunctionArgs, Form, useActionData } from "react-router-dom";
import { importAddresses } from "~/accounts/storage";
import { useEffect } from "react";
import { ActionData, displayNotification } from "../utils/importAccounts";

type FormDataUpdates = {
  addresses: string;
};

export async function action({
  request,
}: ActionFunctionArgs): Promise<ActionData | null> {
  const formData = await request.formData();
  const updates = Object.fromEntries(formData) as unknown as FormDataUpdates;

  const addresses = updates.addresses.split("\n").map((a) => a.trim());
  try {
    const { importedCount, skipped, invalid } =
      await importAddresses(addresses);
    return {
      responseType: "imported successfully",
      importedCount,
      skipped,
      invalid,
    } as ActionData;
  } catch (e) {
    console.error("error importing addresses", e);
    const message = e instanceof Error ? e.message : e;
    return {
      responseType: "error",
      error: `Error importing addresses: ${message}`,
    };
  }
}

export default function ImportAccountAddresses() {
  const actionData = useActionData() as ActionData | undefined;

  // Display error as notification if there is one
  useEffect(() => {
    if (actionData) {
      displayNotification(actionData);
    }
  }, [actionData]);

  return (
    <Stack gap="md" align="flex-start">
      <Form method="post">
        <Stack gap="md" align="flex-start">
          <Textarea
            name="addresses"
            label="Enter one address per line to bulk import. Any address already added will be skipped."
            size="md"
            required
            withAsterisk={false}
            rows={10}
            resize="vertical"
            styles={{
              input: {
                background: 'transparent',
                whiteSpace: 'pre',
                overflowWrap: 'normal',
                overflowX: 'scroll',
              }
            }}
          />
          <Button type="submit" autoContrast>Import</Button>
        </Stack>
      </Form>
    </Stack>
  );
}
