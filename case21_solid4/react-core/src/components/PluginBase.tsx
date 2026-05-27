import { StoreType } from "../types";
import { Dispatcher } from "../store";
import { JSXElement } from "solid-js";
import { createSignal, createContext, useContext } from "solid-js";

export type PluginContextType = {
  provided: boolean;
  store?: StoreType;
  sync?: Dispatcher;
  setStore: (store: StoreType) => void;
  setSync: (sync: Dispatcher) => void;
};

export const PluginContext = createContext({} as PluginContextType);

export function useInitialPluginContext(): PluginContextType {
  const [store, setStore] = createSignal<StoreType | undefined>(undefined);
  const [sync, setSync] = createSignal<Dispatcher>();
  return {
    provided: true,
    store,
    sync,
    setStore,
    setSync,
  };
}

export function usePluginContext(): [boolean, PluginContextType] {
  const ctx = useContext(PluginContext);
  if (ctx?.provided == null) {
    return [false, ctx];
  }
  return [true, ctx];
}

export function usePluginDispatch() {
  const sync = useContext(PluginContext);
  if (!sync) {
    return undefined;
  }
  return sync;
}

type Props = {
  children: JSXElement;
  context: PluginContextType;
};

export function PluginBase(params) {
  const [provided] = usePluginContext();
  if (provided) {
    return <>{params.children}</>;
  }
  return (
    <PluginContext.Provider value={params.context}>
      {params.children}
    </PluginContext.Provider>
  );
}
