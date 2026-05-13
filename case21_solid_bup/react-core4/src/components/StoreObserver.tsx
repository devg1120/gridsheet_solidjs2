import { OptionsType, Connector } from "../types";
import { Context } from "../store";
import { setStore, updateTable } from "../store/actions";
import { usePluginContext } from "./PluginBase";
import { Table } from "../lib/table";
import { createEffect, useContext } from "solid-js";

type StoreObserverProps = OptionsType & {
  sheetName?: string;
  connector?: MutableRefObject<Connector | null>;
};

export const createConnector = () => createRef<Connector | null>();
//export const useConnector = () => useRef<Connector | null>(null);
export const useConnector = () => null;
export const StoreObserver: FC<StoreObserverProps> = ({
  sheetName,
  sheetHeight,
  sheetWidth,
  connector,
  editingOnEnter,
  showAddress,
  mode,
}) => {
  const { store, dispatch } = useContext(Context);
  const { tableReactive: tableRef } = store();
  const table = tableRef;

  createEffect(() => {
    if (!table) {
      return;
    }
    if (sheetName && sheetName !== table.sheetName) {
      table.sheetName = sheetName;
      table.wire.sheetIdsByName[sheetName] = table.sheetId;
      delete table.wire.sheetIdsByName[table.prevSheetName];
      table.prevSheetName = sheetName;
      //hub.transmit();
    }
  }, [sheetName]);

  createEffect(() => {
    if (!table) {
      return;
    }
    const { wire } = table;
    requestAnimationFrame(() => wire.identifyFormula());
    wire.contextsBySheetId[table.sheetId] = { store, dispatch };
    wire.transmit();

    if (connector) {
      connector.current = {
        tableManager: {
          table,
          sync: (table) => {
            dispatch(updateTable(table as Table));
          },
        },
        storeManager: {
          store,
          sync: (store) => {
            dispatch(setStore(store));
          },
          dispatch,
        },
      };
    }
  }, [store, table, connector]);

  createEffect(() => {
    if (sheetHeight) {
      dispatch(setStore({ sheetHeight: sheetHeight }));
      //console.log("setStore sheetHeight", sheetHeight);
    }
  }, [sheetHeight, dispatch]);
  createEffect(() => {
    if (sheetWidth) {
      dispatch(setStore({ sheetWidth }));
      //console.log("setStore sheetWidth", sheetWidth);
    }
  }, [sheetWidth]);
  createEffect(() => {
    if (typeof editingOnEnter !== "undefined") {
      dispatch(setStore({ editingOnEnter }));
    }
  }, [editingOnEnter]);
  createEffect(() => {
    if (typeof showAddress !== "undefined") {
      dispatch(setStore({ showAddress }));
    }
  }, [showAddress]);

  createEffect(() => {
    if (mode) {
      dispatch(setStore({ mode }));
    }
  }, [mode]);

  const [pluginProvided, pluginContext] = usePluginContext();
  createEffect(() => {
    if (!pluginProvided) {
      return;
    }
    pluginContext.setStore(store);
    pluginContext.setSync(() => dispatch);
  }, [store, pluginProvided, pluginContext]);

  return <></>;
};
