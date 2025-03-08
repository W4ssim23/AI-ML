import { GlobalContextProvider } from "./global";

export const Provider = ({ children }) => {
  return <GlobalContextProvider>{children}</GlobalContextProvider>;
};
