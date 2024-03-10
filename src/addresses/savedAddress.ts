import { Address } from "@solana/web3.js";

export type SavedAddress = {
  address: Address;
  label: string;
  notes: string;
  tags: string[];
};
