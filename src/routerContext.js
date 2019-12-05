import { h, createContext } from 'preact';
import { useContext, useEffect, useState } from 'preact/hooks';

const RouterContext = createContext(null);
const RouterStateContext = createContext(null);

export function RouterProvider({ children, router }) {
  const [routerState, setRouterState] = useState(() => router.current());

  useEffect(() => {
    const stop = router.observe(
      ({ navigation, response }) => {
        setRouterState({ navigation, response });
      },

      { initial: false }
    );

    return () => {
      stop();
    };
  }, [router]);

  return (
    <RouterContext.Provider value={router}>
      <RouterStateContext.Provider value={routerState}>
        {children}
      </RouterStateContext.Provider>
    </RouterContext.Provider>
  );
}

export function useRouterState() {
  return useContext(RouterStateContext);
}

export function useRouter() {
  return useContext(RouterContext);
}
