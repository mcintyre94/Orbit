import { storage } from "#imports";

export interface FilterState {
  enableFilters: boolean;
  search: string;
  selectedTags: string[];
}

const FILTER_STATE_KEY = "local:filterState";

export async function getSavedFilterState(): Promise<FilterState | null> {
  try {
    const jsonOrNull = await storage.getItem<string>(FILTER_STATE_KEY);

    if (!jsonOrNull) {
      return null;
    }

    const parsed = JSON.parse(jsonOrNull);

    // Validate structure
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof parsed.enableFilters === "boolean" &&
      typeof parsed.search === "string" &&
      Array.isArray(parsed.selectedTags) &&
      parsed.selectedTags.every((tag: unknown) => typeof tag === "string")
    ) {
      return parsed as FilterState;
    }

    return null;
  } catch (error) {
    console.error("Error reading filter state:", error);
    return null;
  }
}

export async function saveFilterState(state: FilterState): Promise<void> {
  try {
    await storage.setItem<string>(FILTER_STATE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Error saving filter state:", error);
  }
}

export async function clearFilterState(): Promise<void> {
  try {
    await storage.removeItem(FILTER_STATE_KEY);
  } catch (error) {
    console.error("Error clearing filter state:", error);
  }
}
