import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { PrimeReactProvider } from 'primereact/api';

import 'primereact/resources/themes/bootstrap4-dark-blue/theme.css'; //темная
import "primereact/resources/themes/lara-light-cyan/theme.css"; //светлая
import 'primeflex/primeflex.css';   
import 'primeicons/primeicons.css';

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <PrimeReactProvider>
      <App />
    </PrimeReactProvider>
  </React.StrictMode>,
);
