import { CellsByAddressType, Connector, StoreType } from "../types";
import {
  DEFAULT_HEIGHT,
  DEFAULT_WIDTH,
  HEADER_HEIGHT,
  HEADER_WIDTH,
  SHEET_HEIGHT,
  SHEET_WIDTH,
} from "../constants";
import { Context } from "../store";
import { reducer as defaultReducer } from "../store/actions";
import { Editor } from "./Editor";
import { StoreObserver } from "./StoreObserver";
import { Resizer } from "./Resizer";
import { Emitter } from "./Emitter";
import { ContextMenu, defaultContextMenuItems } from "./ContextMenu";
import { Table } from "../lib/table";
import { Tabular } from "./Tabular";
import { getMaxSizesFromCells } from "../lib/structs";
import { x2c, y2r } from "../lib/converters";
import { embedStyle } from "../styles/embedder";
import { FormulaBar } from "./FormulaBar";
import { SearchBar } from "./SearchBar";
import { useHub } from "../lib/hub";
import { ScrollHandle } from "./ScrollHandle";
import { onMount, createSignal, mergeProps, Show } from "solid-js";
import { createStore } from "solid-js/store";
import { createEffect } from "solid-js";


import type { ParentComponent, JSXElement } from 'solid-js';
import { render } from "solid-js/web";

import { createReducer } from "@solid-primitives/memo";
import { setStore } from "../store/actions";

//import Resizable from '@corvu/resizable' // 'corvu/resizable'
//import './index.css'

//import { PanelGroup, Panel, ResizeHandle } from 'solid-resizable-panels';
//import './styles.css';

import { PanelGroup, type PanelGroupAPI, Panel, ResizeHandle } from "./lib";

import "./lib/styles.css";
//import "./styles.css";

//export const createConnector = () => createRef<Connector | null>();  //TODO
//export const useConnector = () => useRef<Connector | null>(null);    //TODO

export function GridSheetPassive({
  //initialCells,
  gsid = "ABC",
  key,
  syncScroll = null,
  table, //GUSA
  sheetName = "",
  connector: initialConnector,
  options = {},
  className,
  style,
  hub: initialHub,
}: PassiveProps) {
  const { sheetResize, showFormulaBar = true, mode = "light" } = options;

  let rootRef = null;
  let mainRef = null;
  let panelGroupRef = null;

  let searchInputRef = null;
  let editorRef = null;
  let largeEditorRef = null; //GUSA
  let tabularRef = null;

  //const internalConnector = useConnector();   //TODO
  //const connector = connector ?? internalConnector;  //TODO
  //const internalHub = useHub({});
  //const hub = hub ?? internalHub;
  //const hub = internalHub; //TODO

  const hub = initialHub;

  const sheetIdRef = 0;
  const sheetId = sheetIdRef;

  let tableReactive = null;

  const initialState = () => {
    if (!sheetName) {
      sheetName = `Sheet${sheetId}`;
      console.debug(
        "GridSheet: sheetName is not provided, using default name:",
        sheetName,
      );
    }
    const { minNumRows, maxNumRows, minNumCols, maxNumCols, contextMenuItems } =
      options;

    table.sheetId = sheetId;
    hub().wire.sheetIdsByName[sheetName] = sheetId;
    hub().wire.onInit?.({ table: table });
    tableReactive = table;

    const store: StoreType = {
      sheetId,
      tableReactive,
      rootRef,
      mainRef,
      searchInputRef,
      editorRef,
      largeEditorRef,
      tabularRef,
      choosing: { y: 5, x: 4 },
      inputting: "",
      selectingZone: { startY: 1, startX: 1, endY: -1, endX: -1 },
      autofillDraggingTo: null,
      leftHeaderSelecting: false,
      topHeaderSelecting: false,
      editingAddress: "--",
      editorRect: { y: 0, x: 0, height: 0, width: 0 },
      dragging: false,
      sheetHeight: 300,
      sheetWidth: 400,
      entering: false,
      matchingCells: [],
      matchingCellIndex: 0,
      searchCaseSensitive: false,
      editingOnEnter: true,
      showAddress: true,
      contextMenuPosition: { y: -1, x: -1 },
      contextMenuItems: contextMenuItems ?? defaultContextMenuItems,
      resizingPositionY: [-1, -1, -1],
      resizingPositionX: [-1, -1, -1],
      minNumRows: 1,
      maxNumRows: -1,
      minNumCols: 1,
      maxNumCols: -1,
      mode: "light",
    };
    //console.log(store)
    return store;
  };

  type ReducerWithoutAction<S> = (prevState: S) => S;

  const [store, dispatch] = createReducer(
    defaultReducer as unknown as ReducerWithoutAction<StoreType>,
    initialState(),
  );

/*
  createEffect(() => {
    let s = store();
    console.log("update store: ", gsid);
    dispatch(setStore({ mainRef: mainRef }));
  });
*/

  createEffect(() => {
    let s = hub();
    //console.log("update hub: ", gsid);
    dispatch(setStore({ tableReactive: tableReactive }));
  });

  createEffect(() => {
    let s = key();
    //console.log("update key: ", gsid);
    dispatch(setStore({ tableReactive: tableReactive }));
  });


  const [loading, setLoading] = createSignal(true);
  const [mount, setMount] = createSignal(false);

  const [c11_width,  set_c11_width ] = createSignal(400);
  const [c11_height, set_c11_height] = createSignal(200);

  const [c12_width,  set_c12_width ] = createSignal(400);
  const [c12_height, set_c12_height] = createSignal(200);

  const [c21_width,  set_c21_width ] = createSignal(400);
  const [c21_height, set_c21_height] = createSignal(200);

  const [c22_width,  set_c22_width ] = createSignal(400);
  const [c22_height, set_c22_height] = createSignal(200);

  onMount(() => {
    setMount(true);
    embedStyle();
    dispatch(setStore({ mainRef: mainRef }));
    setLoading(false);
    console.log("mainRef", mainRef.offsetWidth)
    console.log("mainRef", mainRef.offsetHeight)
    set_c11_width( mainRef.offsetWidth/2 )
    set_c12_width( mainRef.offsetWidth/2 )
    set_c21_width( mainRef.offsetWidth/2 )
    set_c22_width( mainRef.offsetWidth/2 )

    set_c11_height( mainRef.offsetHeight/2 )
    set_c12_height( mainRef.offsetHeight/2 )
    set_c21_height( mainRef.offsetHeight/2 )
    set_c22_height( mainRef.offsetHeight/2 )
  });

  const [sheetHeight, setSheetHeight] = createSignal( options?.sheetHeight || 400);

  const [sheetWidth, setSheetWidth] = createSignal(options?.sheetWidth || 800);

const v_resize = (id, size) => {
      //console.log("..  v_resize", id,size); // 1  2
      if (id == "1") {
           set_c11_height(400*(size/100));
           set_c12_height(400*(size/100));
      } else if ( id == "2" ) {
           set_c21_height(400*(size/100));
           set_c22_height(400*(size/100));
      }
}

const h_resize = (id, size) => {
      //console.log("   ..  h_resize", id,size);  // 11 12 21 22
      
      if (id == "11") {
           set_c11_width(800*(size/100));
      } else if ( id == "12" ) {
           set_c12_width(800*(size/100));
      } else if ( id == "21" ) {
           set_c21_width(800*(size/100));
      } else if ( id == "22" ) {
           set_c22_width(800*(size/100));
      }
      

}
  return (
    <Context.Provider
      value={{
        store: store,
        dispatch: dispatch,
      }}
    >
      <div
        class={`gs-root1 ${hub().wire.ready ? "gs-initialized" : ""}`}
        ref={rootRef}
        data-sheet-name={sheetName}
        data-mode={mode}
      >
        <ScrollHandle
          style={{
            position: "fixed",
            top: 0,
            left: 0,
          }}
        />
        <ScrollHandle
          style={{
            position: "absolute",
            "z-index": 4,
            right: 0,
            top: 0,
            width: 5,
          }}
          horizontal={1}
        />
        <ScrollHandle
          style={{
            position: "absolute",
            "z-index": 4,
            left: 0,
            bottom: 0,
            height: 5,
          }}
          vertical={1}
        />

{/*      TOP FORMULA BAR  */}
{/*       
        {typeof store.searchQuery === "undefined" ? (
          showFormulaBar && <FormulaBar ready={hub().wire.ready} />
        ) : (
          <SearchBar />
        )}
*/}

        <div
          class={`gs-main ${className || ""}`}
          ref={mainRef}

          style="height: 600px;  width:1000px;"
          style={mergeProps(
            {
              "max-width": (store().tableReactive?.totalWidth || 0) + 2 + "px",
              "max-height":
                (store().tableReactive?.totalHeight || 0) + 2 + "px",

              overflow: "auto",
              resize: sheetResize,
            },
            () => style,
          )}
        >
	
          <Editor mode={mode} />

{/*
  <div style="height: 400px;  width:800px;">
          <Tabular gsid={gsid+"A"} syncScroll={syncScroll} />
  </div>
  <div style="height: 300px;  width:600px;">
          <Tabular gsid={gsid+"B"} syncScroll={syncScroll} />
  </div>
  <div style="height: 300px;  width:400px;">
          <Tabular gsid={gsid+"C"} syncScroll={syncScroll} />
  </div>
  <div style="height: 200px;  width:300px;">
          <Tabular gsid={gsid+"D"} syncScroll={syncScroll} />
  </div>
*/}

{/*
 <div 
       ref={panelGroupRef}
       style="height: 400px;  width:800px;"
        >
*/}

 <div 
       ref={panelGroupRef}
       style="height: 100%;  width:100%;"
        >
              <PanelGroup  direction="column">
                   <Panel id="1" onResize={(size) => v_resize("1", size)}>
                      <PanelGroup>
                        <Panel id="11" onResize={(size) => h_resize("11", size)}>
                            <Tabular sheetWidth={c11_width} sheetHeight={c11_height} gsid={gsid+"-A"}  />
			</Panel>
                        <ResizeHandle />
                        <Panel id="12" onResize={(size) => h_resize("12", size)}>
                            <Tabular sheetWidth={c12_width} sheetHeight={c12_height} gsid={gsid+"-B"}  />
			</Panel>
                      </PanelGroup>
                   </Panel>
                <ResizeHandle />
                   <Panel id="2" onResize={(size) => v_resize("2", size)}>
                      <PanelGroup>
                        <Panel id="21" onResize={(size) => h_resize("21", size)}>
                            <Tabular sheetWidth={c21_width} sheetHeight={c21_height} gsid={gsid+"-C"}  />
			</Panel>
                        <ResizeHandle />
                        <Panel id="22" onResize={(size) => h_resize("22", size)}>
                            <Tabular sheetWidth={c22_width} sheetHeight={c22_height} gsid={gsid+"-D"}  />
			</Panel>
                      </PanelGroup>
                   </Panel>
              </PanelGroup>

</div>


{/*
          <Tabular gsid={gsid} syncScroll={syncScroll} />
          <Tabular gsid={gsid}  />
          <Tabular gsid={gsid}  />
          <Tabular gsid={gsid}  />

*/}



    
          <StoreObserver
            {...{ ...options, sheetHeight, sheetWidth, sheetName }}
          />

          <ContextMenu />
          <Show when={!loading()} fallback={<div>Loading...</div>}>
            <Resizer />
          </Show>
          <Emitter />
        </div>
      </div>
    </Context.Provider>
  );
}

const estimateSheetHeight = (initialCells: CellsByAddressType) => {
  const auto = getMaxSizesFromCells(initialCells);
  let estimatedHeight = initialCells[0]?.height ?? HEADER_HEIGHT;
  for (let y = 0; y < auto.numRows; y++) {
    const row = y2r(y);
    const height =
      initialCells?.[row]?.height ||
      initialCells?.default?.height ||
      DEFAULT_HEIGHT;
    if (estimatedHeight + height > SHEET_HEIGHT) {
      return SHEET_HEIGHT;
    }
    estimatedHeight += height;
  }
  return estimatedHeight + 3;
};

const estimateSheetWidth = (initialCells: CellsByAddressType) => {
  const auto = getMaxSizesFromCells(initialCells);
  let estimatedWidth = initialCells[0]?.width ?? HEADER_WIDTH;
  for (let x = 0; x < auto.numCols; x++) {
    const col = x2c(x);
    const width =
      initialCells?.[col]?.width ||
      initialCells?.default?.width ||
      DEFAULT_WIDTH;
    if (estimatedWidth + width > SHEET_WIDTH) {
      return SHEET_WIDTH;
    }
    estimatedWidth += width;
  }
  return estimatedWidth + 3;
};
