// "JSX in a real component" — our Header, running as a real React component next to its code.
// Same JSX structure as src/components/Layout.jsx (router links become plain links here).
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { PATH, Svg } from './shared.jsx';

function Header({ accessToken, user, cartCount, onSignOut, onSignIn, onOpen }) {
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen((o) => { onOpen(!o); return !o; });
  return (
    <header className="mh jh-header">
      <div className="mh-inner">
        <a className="mh-brand" href="#" onClick={(e) => e.preventDefault()}><Svg d={PATH.utensils} /> Trattoria</a>
        <button className={`jh-toggle ${open ? 'is-open' : ''}`} type="button" aria-expanded={open} aria-label="Toggle menu" onClick={toggle}>
          <span className="mh-bar" /><span className="mh-bar" /><span className="mh-bar" />
        </button>
        <nav className={`mh-nav ${open ? 'open' : ''}`}>
          <a href="#" onClick={(e) => e.preventDefault()}>Menu</a>
          {accessToken ? (
            <>
              <a href="#" className="mh-cart" onClick={(e) => e.preventDefault()}>
                <Svg d={PATH.bag} /> Cart{cartCount > 0 && <span className="mh-count">{cartCount}</span>}
              </a>
              <a href="#" onClick={(e) => e.preventDefault()}><Svg d={PATH.user} /> {user?.firstName || 'Profile'}</a>
              <button className="mh-btn" type="button" onClick={onSignOut}>Sign out</button>
            </>
          ) : (
            <a href="#" className="jh-signin" onClick={(e) => { e.preventDefault(); onSignIn(); }}>Sign in</a>
          )}
        </nav>
      </div>
    </header>
  );
}

function Demo() {
  const [accessToken, setToken] = useState('eyJhbGciOi…');
  const [cartCount, setCart] = useState(2);
  const [open, setOpen] = useState(false);
  const user = { firstName: 'Nino' };
  return (
    <>
      <Header accessToken={accessToken} user={user} cartCount={cartCount} onOpen={setOpen}
        onSignOut={() => setToken(null)} onSignIn={() => setToken('eyJhbGciOi…')} />
      <div className="jh-state">
        <span className="jh-chip mono">accessToken: <b>{accessToken ? `"${accessToken}"` : 'null'}</b></span>
        <span className="jh-chip mono">cartCount: <b>{cartCount}</b></span>
        <span className="jh-chip mono">open: <b>{String(open)}</b></span>
        <span className="jh-ctrl">
          <button type="button" className="btn" onClick={() => setCart((c) => Math.max(0, c - 1))} aria-label="remove from cart">−</button>
          <button type="button" className="btn" onClick={() => setCart((c) => c + 1)}>+ cart</button>
          <button type="button" className="btn" onClick={() => setToken((t) => (t ? null : 'eyJhbGciOi…'))}>{accessToken ? 'sign out' : 'sign in'}</button>
        </span>
      </div>
    </>
  );
}

export function mountHeaderDemo(host) {
  const root = createRoot(host);
  root.render(<Demo />);
  return () => root.unmount();
}
