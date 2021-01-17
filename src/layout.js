import * as React from 'react';

import { Link } from './link';
import { useRouterState } from './routerContext';

export function Layout({ children }) {
  const state = useRouterState();

  return (
    <>
      <header>
        <details>
          <summary>Menu</summary>

          <nav>
            <ul>
              <li>
                <Link to="home">Home</Link>
              </li>
            </ul>
          </nav>
        </details>
      </header>

      <main>{children}</main>

      <footer>
        <details>
          <summary>Current location</summary>

          <pre>{JSON.stringify(state, null, 2)}</pre>
        </details>
      </footer>
    </>
  );
}
