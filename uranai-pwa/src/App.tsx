import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { getAIConfig } from './storage/keychain';
import { getProfile } from './db/queries';
import { Welcome }    from './screens/Welcome';
import { ApiKey }     from './screens/ApiKey';
import { ApiKeyHelp } from './screens/ApiKeyHelp';
import { Profile }    from './screens/Profile';
import { Home }       from './screens/Home';
import { Ask }        from './screens/Ask';
import { Reveal }     from './screens/Reveal';
import { History }    from './screens/History';
import { Settings }   from './screens/Settings';

function RouteGuard({ children }: { children: React.ReactNode }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const unguarded = ['/', '/api-key', '/api-key-help'];

    if (unguarded.includes(location.pathname)) {
      setReady(true);
      return;
    }

    setReady(false);

    const config = getAIConfig();
    if (!config) {
      navigate('/', { replace: true });
      return;
    }

    getProfile().then(profile => {
      if (cancelled) return;
      if (!profile && location.pathname !== '/profile') {
        navigate('/profile', { replace: true });
      } else {
        setReady(true);
      }
    });

    return () => { cancelled = true; };
  }, [location.pathname, navigate]);

  if (!ready) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', color: '#00e5ff', fontFamily: 'monospace', fontSize: 14,
      }}>
        起動中...
      </div>
    );
  }
  return <>{children}</>;
}

export function App() {
  return (
    <HashRouter>
      <RouteGuard>
        <Routes>
          <Route path="/"             element={<Welcome />} />
          <Route path="/api-key"      element={<ApiKey />} />
          <Route path="/api-key-help" element={<ApiKeyHelp />} />
          <Route path="/profile"          element={<Profile isOnboarding />} />
          <Route path="/settings/profile" element={<Profile />} />
          <Route path="/home"             element={<Home />} />
          <Route path="/ask"          element={<Ask />} />
          <Route path="/reveal/:id"   element={<Reveal />} />
          <Route path="/history"      element={<History />} />
          <Route path="/settings"     element={<Settings />} />
          <Route path="*"             element={<Navigate to="/" replace />} />
        </Routes>
      </RouteGuard>
    </HashRouter>
  );
}
