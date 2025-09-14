import { createContext } from 'react-router';

export const csrfTokenContext = createContext<string | undefined>();
