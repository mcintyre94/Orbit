type QueryParams = {
    view: 'home'
} | {
    view: 'connect',
    tabId: number,
    requestId: number,
};

function getView(view: string | null): QueryParams['view'] {
    if(view === 'connect') return 'connect';
    return 'home';
}

function getNumberFromQuery(value: string | null, field: string): number {
    if(value === null) {
        // TODO: proper errors
        throw new Error(`${field} is required for this route`)
    }
    const valueNumber = Number.parseInt(value);
    if(Number.isNaN(valueNumber)) {
        // TODO: proper errors
        throw new Error(`${field} ${value} is not valid`)
    }
    return valueNumber;
}

function getTabId(tabId: string | null): number {
    return getNumberFromQuery(tabId, 'tabId');
}

function getRequestId(requestId: string | null): number {
    return getNumberFromQuery(requestId, 'requestId');
}

export function getQueryParamsFromSearchParams(searchParams: URLSearchParams) {
    const viewString = searchParams.get('view');
    const view = getView(searchParams.get('view'));
    if(view === 'home') {
        return {view};
    }
    const tabId = getTabId(searchParams.get('tabId'));
    const requestId = getRequestId(searchParams.get('requestId'));
    return {
        view,
        tabId,
        requestId
    }
}