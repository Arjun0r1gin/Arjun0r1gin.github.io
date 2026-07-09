import { createRoot } from 'react-dom/client';
import './index.css';
import { CmsProvider } from './providers/CmsProvider';
import { MissionControlCms } from './components/admin/MissionControlCms';

createRoot(document.getElementById('root')!).render(
  <CmsProvider>
    <MissionControlCms onClose={() => { window.location.href = '/' }} />
  </CmsProvider>
);
