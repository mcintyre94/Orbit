export type QueryParams =
  | {
      view: "home";
    }
  | {
      view: "connect";
      tabId: number;
      requestId: number;
      forOrigin: string;
    };

function getView(view: string | null): QueryParams["view"] {
  if (view === "connect") return "connect";
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
  if (view === "home") {
    return { view };
  }
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
