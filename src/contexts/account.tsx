import React, { createContext, useContext, useState, useMemo, ReactNode } from "react";

type Account = { id?: string; name?: string } | null;

type AccountContextType = {
  account: Account;
  setAccount: React.Dispatch<React.SetStateAction<Account>>;
};

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export const AccountProvider = ({ children }: { children: ReactNode }) => {
  const [account, setAccount] = useState<Account>(null);

  const value = useMemo(() => ({ account, setAccount }), [account]);

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
};

export const useAccount = () => {
  const ctx = useContext(AccountContext);
  if (!ctx) throw new Error("useAccount must be used within AccountProvider");
  return ctx;
};

export default AccountContext;
