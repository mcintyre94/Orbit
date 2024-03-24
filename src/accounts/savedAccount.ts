import { Address, isAddress } from "@solana/web3.js";
import { z } from "zod";

export type SavedAccount = {
  address: Address;
  label: string;
  notes: string;
  tags: string[];
};

export const savedAccountSchema = z.object({
  address: z
    .string()
    .refine((a) => isAddress(a), { message: "Invalid address" }),
  label: z.string(),
  notes: z.string(),
  tags: z.array(z.string()),
});
