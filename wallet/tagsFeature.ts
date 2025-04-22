export const AccountsTags = "accounts:tags";

export type AccountsTagsVersion = "1.0.0";

type GetTagsForAddressesInput = {
  addresses: string[];
};

type GetTagsForAddressesOutput = {
  tags: { [address: string]: string[] };
};

export type GetTagsForAddressesMethod = (
  input: GetTagsForAddressesInput
) => Promise<GetTagsForAddressesOutput>;

export type AccountsTagsFeature = {
  [AccountsTags]: {
    version: AccountsTagsVersion;
    getTagsForAddresses: GetTagsForAddressesMethod;
  };
};
