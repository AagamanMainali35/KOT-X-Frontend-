import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { TablesProvider } from './context/TablesContext';
import { OrderProvider } from "./context/OrderContext";
import { AutoFetchProvider   } from "./context/AutoFetchContext";
import App from './App.jsx';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <TablesProvider>
    <OrderProvider>
      <AutoFetchProvider>
        <App />
      </AutoFetchProvider>
    </OrderProvider>
    </TablesProvider>
  </StrictMode>,
)