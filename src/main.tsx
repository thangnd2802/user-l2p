import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from "react-router-dom";

const basename = "/REPO_NAME";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
        <BrowserRouter basename={basename}>
    <App />
        </BrowserRouter>
  </StrictMode>,
)
