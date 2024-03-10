export type QueryParams =
  | {
      view: "home";
    }
  | {
      view: "connect";
      tabId: number;
      requestId: number;
      forOrigin: string;
    }
  | {
      view: "newAddress";
      tags: string[];
    };

function getView(view: string | null): QueryParams["view"] {
  console.log("getView", { view });
  if (view === "connect") return "connect";
  if (view === "newAddress") return "newAddress";
  return "home";
}

function getNumberFromQuery(value: string | null, field: string): number {
  if (value === null) {
    // TODO: proper errors
    throw new Error(`${field} is required for this route`);
  }
  const valueNumber = Number.parseInt(value);
  if (Number.isNaN(valueNumber)) {
    // TODO: proper errors
    throw new Error(`${field} ${value} is not valid`);
  }
  return valueNumber;
}

function getStringFromQuery(value: string | null, field: string): string {
  if (value === null) {
    // TODO: proper errors
    throw new Error(`${field} is required for this route`);
  }

  return value;
}

export function getQueryParamsFromSearchParams(
  searchParams: URLSearchParams
): QueryParams {
  const view = getView(searchParams.get("view"));
  console.log("getQueryParamsFromSearchParams", { view });
  if (view === "home") {
    return { view };
  }

  if (view === "newAddress") {
    const tags = searchParams.getAll("tags");
    return { view, tags };
  }

  if (view === "connect") {
    const tabId = getNumberFromQuery(searchParams.get("tabId"), "tabId");
    const requestId = getNumberFromQuery(
      searchParams.get("requestId"),
      "requestId"
    );
    const forOrigin = getStringFromQuery(
      searchParams.get("forOrigin"),
      "forOrigin"
    );
    return {
      view,
      tabId,
      requestId,
      forOrigin,
    };
  }

  // default to home
  return { view: "home" };
}
