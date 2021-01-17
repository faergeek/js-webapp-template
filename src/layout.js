import * as React from 'react';

import { Link } from './link';

export function Layout({ children }) {
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
    </>
  );
}
