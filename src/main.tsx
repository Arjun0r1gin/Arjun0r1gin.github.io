import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { CmsProvider } from './providers/CmsProvider'

createRoot(document.getElementById('root')!).render(
  <CmsProvider>
    <App />
  </CmsProvider>,
)
