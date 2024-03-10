import './App.css'
import { type QueryParams, getQueryParamsFromSearchParams } from './utils/queryParams';
import Connect from './views/Connect';
import Home from './views/Home';

function Inner({ params }: { params: QueryParams }) {
  if (params.view === 'connect') {
    return <Connect tabId={params.tabId} requestId={params.requestId} forOrigin={params.forOrigin} />
  } else {
    return <Home />
  }
}

export default function App() {
  const query = new URLSearchParams(window.location.search);
  const params = getQueryParamsFromSearchParams(query);

  return (
    <div className="App">
      <Inner params={params} />
    </div>
  )
}
