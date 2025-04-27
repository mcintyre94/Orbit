/** Name of the feature. */
export const AccountsTags = "accounts:tags";

/**
 * `accounts:tags` is a {@link "@wallet-standard/base".Wallet.features | feature} that may be implemented by a
 * {@link "@wallet-standard/base".Wallet} to allow the app to obtain the tags for the given
 * {@link "@wallet-standard/base".Wallet.accounts}.
 */
export type AccountsTagsFeature = {
  /** Name of the feature. */
  readonly [AccountsTags]: {
    /** Version of the feature implemented by the Wallet. */
    readonly version: AccountsTagsVersion;
    /** Method to call to use the feature. */
    readonly getTags: AccountsTagsMethod;
  };
};

/**
 * Version of the {@link AccountsTagsFeature} implemented by a {@link "@wallet-standard/base".Wallet}.
 */
export type AccountsTagsVersion = "1.0.0";

/**
 * Method to call to use the {@link AccountsTagsFeature}.
 */
export type AccountsTagsMethod = (
  input: AccountsTagsInput
) => Promise<AccountsTagsOutput>;

/**
 * Input for the {@link AccountsTagsMethod}.
 */
export interface AccountsTagsInput {
  readonly addresses: readonly string[];
}

/**
 * Output of the {@link AccountsTagsMethod}.
 */
export interface AccountsTagsOutput {
  /** List of tags for each of the addresses */
  readonly tagsForAccounts: Record<string, string[]>;
}
