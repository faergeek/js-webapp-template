import * as React from 'react';

const RouterContext = React.createContext(null);
const RouterStateContext = React.createContext(null);

export function RouterProvider({ children, router }) {
  const [routerState, setRouterState] = React.useState(() => router.current());

  React.useEffect(() => {
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
  return React.useContext(RouterStateContext);
}

export function useRouter() {
  return React.useContext(RouterContext);
}
