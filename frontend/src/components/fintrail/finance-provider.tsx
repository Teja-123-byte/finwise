import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useFinanceStore } from "@/stores/finance-store";

type Store = ReturnType<typeof useFinanceStore>;

const FinanceContext = createContext<Store | null>(null);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const store = useFinanceStore();
  const initialize = useFinanceStore((state) => state.initialize);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  return <FinanceContext.Provider value={store}>{children}</FinanceContext.Provider>;
}

export function useFinance(): Store {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error("useFinance must be used inside <FinanceProvider>");
  return ctx;
}
