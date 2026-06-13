import { CellsByAddressType, Connector, StoreType } from "../types";
import { DEFAULT_HEIGHT, DEFAULT_WIDTH, HEADER_HEIGHT, HEADER_WIDTH, SHEET_HEIGHT, SHEET_WIDTH } from "../constants";
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
import { onMount, createSignal, mergeProps } from "solid-js";
import { createStore } from "solid-js/store";

import { createReducer } from "@solid-primitives/memo";

//export const createConnector = () => createRef<Connector | null>();  //TODO
//export const useConnector = () => useRef<Connector | null>(null);    //TODO

//export function GridSheetPassive(params) {

export function GridSheetPassive({
  //initialCells,
  table ,   //GUSA
  //table  ,   //GUSA
  
  sheetName = "",
  connector: initialConnector,
  options = {},
  className,
  style,
  hub: initialHub,
}: PassiveProps) {


    const { sheetResize, showFormulaBar = true, mode = "light" } = options;
    //const rootRef = useRef<HTMLDivElement>(null);
    //const mainRef = useRef<HTMLDivElement>(null);
    //const searchInputRef = useRef<HTMLTextAreaElement>(null);
    //const editorRef = useRef<HTMLTextAreaElement>(null);
    //const largeEditorRef = useRef<HTMLTextAreaElement>(null); //GUSA
    //const tabularRef = useRef<HTMLDivElement>(null);

    let rootRef = null;
    let mainRef = null;
    let searchInputRef = null;
    let editorRef = null;
    let largeEditorRef = null; //GUSA
    let tabularRef = null;

    //const internalConnector = useConnector();   //TODO
    //const connector = connector ?? internalConnector;  //TODO

    const internalHub = useHub({});
    //const hub = hub ?? internalHub;
    const hub = internalHub; //TODO



    // useRef to manage sheetId and avoid Strict Mode issues
    //const sheetIdRef = useRef<number | null>(null);
    //if (sheetIdRef === null) {                                        //PeD
    //    sheetIdRef = ++hub.wire.sheetHead;
    //}

    const sheetIdRef = 0;
    const sheetId = sheetIdRef;


    // Initialize tableReactive
    //const tableReactive = useRef<Table | null>(null);
    let  tableReactive = null;

    //const [initialState] = createSignal<StoreType>(() => {
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

        /*
            const table = new Table({
              minNumRows,
              maxNumRows,
              minNumCols,
              maxNumCols,
              sheetName,
              hub: wire,
            });
        */
        table.sheetId = sheetId;
        hub.wire.sheetIdsByName[sheetName] = sheetId;

        //GUSA table.initialize(initialCells);
        hub.wire.onInit?.({ table: table });

        //table.setTotalSize();
        //tableReactive.current = (params.table as Table);
        //tableReactive = (params.table as Table);
        tableReactive = table ;

        const store: StoreType = {
            sheetId,
            tableReactive,
            rootRef,
            mainRef,
            searchInputRef,
            editorRef,
            largeEditorRef,
            tabularRef,
            choosing: { y: 1, x: 1 },
            inputting: "",
            selectingZone: { startY: 1, startX: 1, endY: -1, endX: -1 },
            autofillDraggingTo: null,
            leftHeaderSelecting: false,
            topHeaderSelecting: false,
            editingAddress: "",
            editorRect: { y: 0, x: 0, height: 0, width: 0 },
            dragging: false,
            sheetHeight: 500,
            sheetWidth: 500,
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
        return store;
    };

    type ReducerWithoutAction<S> = (prevState: S) => S;
/*
    const [store, dispatch] = useReducer(
        defaultReducer as unknown as ReducerWithoutAction<StoreType>,
        initialState(),
        () => initialState(),
    );
*/

    const [store, dispatch] = createReducer(
        defaultReducer as unknown as ReducerWithoutAction<StoreType>,
        initialState(),
    );

    onMount(() => {
        embedStyle();
    });


    const [sheetHeight, setSheetHeight] = createSignal(
        options?.sheetHeight || 400,
    );

    console.log(sheetHeight());

    const [sheetWidth, setSheetWidth] = createSignal(
        options?.sheetWidth || 800,
    );
    console.log(sheetWidth());

    return (
        <Context.Provider value={{
            store: store,
            dispatch: dispatch
        }}>


            <div
                //class={`gs-root1 ${hub.wire.ready ? "gs-initialized" : ""}`}
                class={`gs-root-gusa ${hub.wire.ready ? "gs-initialized" : ""}`}
                ref={rootRef}
                data-sheet-name={sheetName}
                data-mode={mode}
            >


                <ScrollHandle style={{
                    position: "fixed",
                    top: 0,
                    left: 0
                }} />
                <ScrollHandle
                    style={{
                        position: "absolute",
                        zIndex: 4,
                        right: 0,
                        top: 0,
                        width: 5
                    }}
                    horizontal={1}
                />
                <ScrollHandle
                    style={{
                        position: "absolute",
                        zIndex: 4,
                        left: 0,
                        bottom: 0,
                        height: 5
                    }}
                    vertical={1}
                />

                {typeof store.searchQuery === "undefined" ? (
                    showFormulaBar && <FormulaBar ready={hub.wire.ready} />
                ) : (
                    <SearchBar />
                )}

                <div
                    class={`gs-main ${className || ""}`}
                    ref={mainRef}
                    style={mergeProps({
                        maxWidth: ((store.tableReactive?.totalWidth || 0) + 2) +"px",
                        maxHeight:((store.tableReactive?.totalHeight || 0) + 2) +"px",

                        overflow: "auto",
                        resize: sheetResize
                    }, () => style)}
                >
		    <Editor mode={mode} />
                    <Tabular />
		    {/*
                    <StoreObserver {...{ ...options, sheetHeight, sheetWidth, sheetName, connector }} />
                    <StoreObserver {...{ ...options, sheetHeight, sheetWidth, sheetName  }} />
		    */}
                    <StoreObserver {...{ ...options, sheetHeight, sheetWidth, sheetName  }} />


                    <ContextMenu />
                    <Resizer />
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
