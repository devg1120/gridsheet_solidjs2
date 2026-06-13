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
      sheetHeight: 400,
      sheetWidth: 800,
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

  onMount(() => {
    setMount(true);
    embedStyle();
    dispatch(setStore({ mainRef: mainRef }));
    setLoading(false);
  });

  const [sheetHeight, setSheetHeight] = createSignal( options?.sheetHeight || 400);

  const [sheetWidth, setSheetWidth] = createSignal(options?.sheetWidth || 800);

const PaneY: ParentComponent<{
  topElem: JSXElement,
  bottomElem: JSXElement
}> = (props) => {
  const [height, setHeight] = createSignal(0)
  let paneContainerRef: HTMLDivElement | undefined;

  let onMouseDownHandler = (e: MouseEvent) => {
    onmousemove = (e: MouseEvent) => {
      //setHeight(e.clientY - paneContainerRef.offsetTop)
      setHeight(e.clientY - paneContainerRef.getBoundingClientRect().top)
    }
    onmouseup = (e: MouseEvent) => {
      onmousemove = () => null
      onmouseup = () => null
    }
  }

  onMount(() => {
    if (paneContainerRef) {
      setHeight(paneContainerRef.clientHeight / 2)
    }
  })

  return (
    <>
      <div
        ref={paneContainerRef}
        style={{
          'display': 'flex',
          'flex-flow': 'column',
          'height': '100%',
        }}
      >
        <div style={{
          'height': `${paneContainerRef ? (height() / paneContainerRef.clientHeight)*100 : 50}%`,
          'background-color': 'rgba(120, 120, 230, 0.2)'
        }}>
          {props.topElem}
        </div>
        <div
          onMouseDown={onMouseDownHandler}
          style='
            min-width: 5px;
            min-height: 5px;
            background-color: #c0c0c0;
            cursor: row-resize;
	    z-index: 9999999;
          '
        ></div>
        <div
          style={{
            'height': `${paneContainerRef ? (100 - (height() / paneContainerRef?.clientHeight)*100) : 50}%`,
            'background-color': 'rgba(120, 230, 120, 0.2)'
          }}
        >
          {props.bottomElem}
        </div>
      </div>
    </>
  )
}

const PaneX: ParentComponent<{
  leftElem: JSXElement,
  rightElem: JSXElement,
}> = (props) => {
  const [width, setWidth] = createSignal(0)
  let paneContainerRef: HTMLDivElement | undefined;

  let onMouseDownHandler = (e: MouseEvent) => {
    onmousemove = (e: MouseEvent) => {
      //setWidth(e.clientX - paneContainerRef.offsetLeft)
      setWidth(e.clientX - paneContainerRef.getBoundingClientRect().left)
    }
    onmouseup = (e: MouseEvent) => {
      onmousemove = () => null
      onmouseup = () => null
    }
  }

  onMount(() => {
    if (paneContainerRef) {
      setWidth(paneContainerRef.clientWidth / 2)
    }
  })


const v_resize = (id, size) => {
      console.log("..  v_resize", id,size);
}

const h_resize = (id, size) => {
      console.log("   ..  h_resize", id,size);
}

  return (
    <>
      <div
        ref={paneContainerRef}
        style={{
          'display': 'flex',
          'flex-flow': 'row',
          'height': '100%',
          'width': '100%',
        }}
      >
        <div style={{
          'width': `${paneContainerRef ? (width() / paneContainerRef.clientWidth)*100 : 50}%`,
          'background-color': 'rgba(120, 120, 230, 0.2)'
        }}>
          {props.leftElem}
        </div>
        <div
          onMouseDown={onMouseDownHandler}
          style='
            min-width: 5px;
            min-height: 5px;
            background-color: #c0c0c0;
            cursor: col-resize;
	    z-index: 9999999;
          '
        ></div>
        <div
          style={{
            'width': `${paneContainerRef ? (100 - (width() / paneContainerRef?.clientWidth)*100) : 50}%`,
            'background-color': 'rgba(120, 230, 120, 0.2)'
          }}
        >
          {props.rightElem}
        </div>
      </div>
    </>
  )
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

        {typeof store.searchQuery === "undefined" ? (
          showFormulaBar && <FormulaBar ready={hub().wire.ready} />
        ) : (
          <SearchBar />
        )}

        <div
          class={`gs-main ${className || ""}`}
          ref={mainRef}
	  id={gsid}
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

{/*
  <div style="max-height: 600px;  max-width:800px;">

              <PanelGroup  direction="column">
                   <Panel id="1" onResize={(size) => v_resize("1", size)}>
                      <PanelGroup>
                        <Panel id="11" onResize={(size) => h_resize("11", size)}>
                            <Tabular gsid={gsid}  />
			</Panel>
                        <ResizeHandle />
                        <Panel id="12" onResize={(size) => h_resize("12", size)}>
                            <Tabular gsid={gsid}  />
			</Panel>
                      </PanelGroup>
                   </Panel>
                <ResizeHandle />
                   <Panel id="2" onResize={(size) => v_resize("2", size)}>
                      <PanelGroup>
                        <Panel id="21" onResize={(size) => h_resize("21", size)}>
                            <Tabular gsid={gsid}  />
			</Panel>
                        <ResizeHandle />
                        <Panel id="22" onResize={(size) => h_resize("22", size)}>
                            <Tabular gsid={gsid}  />
			</Panel>
                      </PanelGroup>
                   </Panel>
              </PanelGroup>
</div>
*/}
{/*
          <Tabular gsid={gsid} syncScroll={syncScroll} />
          <Tabular gsid={gsid}  />
          <Tabular gsid={gsid}  />
          <Tabular gsid={gsid}  />

*/}

{/*
  <div style="height: 800px;  width:1800px;">
      <PaneY
        topElem={
          <PaneX
            leftElem={
              <Tabular gsid={gsid+"A"}   syncScroll={syncScroll}/>
            }
            rightElem={
              <Tabular gsid={gsid+"B"}   syncScroll={syncScroll}/>
            }
          ></PaneX>
        }
        bottomElem={
          <PaneX
            leftElem={
              <Tabular gsid={gsid+"C"}   syncScroll={syncScroll}/>
            }
            rightElem={
              <Tabular gsid={gsid+"D"}   syncScroll={syncScroll}/>
            }
          ></PaneX>
        }
      ></PaneY>
    </div>
*/}

{/*
  <div style="height: 600px;  width:800px;">
      <PaneY
        topElem={
          <PaneX
            leftElem={
	      <>
               <div>top left text</div>
               <input  type="date" tabindex={9999} />
	      </>
            }
            rightElem={
	      <>
               <div>top right text</div>
               <input  type="date" tabindex={9999} />
	      </>
            }
          ></PaneX>
        }
        bottomElem={
          <PaneX
            leftElem={
	      <>
               <div>bottom left text</div>
               <input  type="date" tabindex={9999} />
	      </>
            }
            rightElem={
	      <>
               <div>bottom right text</div>
               <input  type="date" tabindex={9999} />
	      </>
            }
          ></PaneX>
        }
      ></PaneY>
    </div>
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
