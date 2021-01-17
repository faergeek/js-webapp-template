import { Link } from '@curi/react-dom';
import * as React from 'react';

export function Layout({ children }) {
  return (
    <>
      <header>
        <details>
          <summary>Menu</summary>

          <nav>
            <ul>
              <li>
                <Link name="home">Home</Link>
              </li>
            </ul>
          </nav>
        </details>
      </header>

      <main>{children}</main>
    </>
  );
}
