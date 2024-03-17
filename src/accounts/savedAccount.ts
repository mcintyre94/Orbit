import { Address } from "@solana/web3.js";

export type SavedAccount = {
  address: Address;
  label: string;
  notes: string;
  tags: string[];
};
