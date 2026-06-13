import { Cell } from "./Cell";
import { HeaderCellTop } from "./HeaderCellTop";
import { HeaderCellLeft } from "./HeaderCellLeft";
import { Context } from "../store";
import { choose, select, arrow } from "../store/actions";
import {
  RefPaletteType,
  PointType,
  StoreType,
  Virtualization,
  SpanElementType,
} from "../types";
import { virtualize } from "../lib/virtualization";
import { a2p, p2a, y2r, x2c, stripAddressAbsolute } from "../lib/converters";
import { zoneToArea } from "../lib/structs";
import { Lexer, stripSheetName } from "../formula/evaluator";
import { COLOR_PALETTE } from "../lib/palette";
import { Autofill } from "../lib/autofill";
import { ScrollHandle } from "./ScrollHandle";
import { setStore } from "../store/actions";

import {
  createEffect,
  on,
  onMount,
  useContext,
  createSignal,
  For,
  Index,
} from "solid-js";

//export const Tabular = () => {
export function Tabular({
  gsid = "ABC",
  syncScroll = null,
}: PassiveProps) {


  const [palette, setPalette] = createSignal<RefPaletteType>({});
  const { store, dispatch } = useContext(Context);

  let {
    tableReactive,
    //choosing,
    editingAddress,
    tabularRef,
    mainRef,
    sheetWidth,
    sheetHeight,
    inputting,
    leftHeaderSelecting,
    topHeaderSelecting,
  } = store();

  const [key, setKey] = createSignal([{}]);

  const [tablekey, setTableKey] = createSignal([{}]);

  const [choosing, setChoosing] = createSignal(store().choosing);

  const [tableFocus, setTableFocus] = createSignal(true);

  const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    //console.log("handleFocus");
  };

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    //console.log("handleDragStart");
    tabularRef.focus();
    tabularRef.focus();
  };

  createEffect(() => {
    //console.log("choosing...");
    setChoosing(store().choosing);
    operationStyles = useOperationStyles(store, {
      ...palette(),
      ...table.wire.paletteBySheetName[table.sheetName],
    });

    setKey([{}]);
  });

  createEffect(() => {
    //console.log("store update");
    table = store().tableReactive;
    setTableKey([{}]);
  });

  let table = tableReactive;

  let tableRef = null;

  const [virtualized, setVirtualized] = createSignal<Virtualization | null>(
    null,
  );

  const handleMouseMove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleWheel = (e: WheelEvent) => {
    //console.log("wheel");
    //e.preventDefault(); // Prevents the default page scroll
    //e.stopPropagation();
    /*
     if(e.shiftKey){
         tabularRef.scrollTo({left:tabularRef.scrollLeft + e.deltaY })

     } else {
         tabularRef.scrollTo({top:tabularRef.scrollTop + e.deltaY })

     }
    */

    //setVirtualized(virtualize(table, e.currentTarget));

    setVirtualized(virtualize(table, tabularRef));
    setTableKey([{}]);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    //console.log("scroll",e.srcElement)
    //console.log("scroll",gsid, e.srcElement.scrollTop, e.srcElement.scrollLeft)
    if (syncScroll != null ) {
        //console.log("syncScroll");
        syncScroll(gsid, e.srcElement, e.srcElement.scrollTop, e.srcElement.scrollLeft)
    }
    //e.preventDefault();
    //e.stopPropagation();

    //if  (!pointerDown) { return;}
    /*
    if  (!pointerDown) { 
	  if(!pageDown  && !pageUp) {
	    return;
	  }
        console.log("pageDown/Up scroll")

    } else {
       console.log("scrollBar scroll")
    }
    */

    setVirtualized(virtualize(table, tabularRef));
    setTableKey([{}]);
  };

  const handleSelectAllClick = () => {
    if (!table) {
      return;
    }
    dispatch(choose({ y: -1, x: -1 }));
    requestAnimationFrame(() => {
      dispatch(choose({ y: 1, x: 1 }));
      dispatch(
        select({
          startY: 1,
          startX: 1,
          endY: table.getNumRows(),
          endX: table.getNumCols(),
        }),
      );
    });
  };

  createEffect(
    on(
      () => [store().inputting, store().editingAddress, tableReactive],
      () => {
        if (!table) {
          return;
        }
        const formulaEditing = editingAddress && inputting.startsWith("=");
        if (!formulaEditing) {
          setPalette({});
          //table.wire.paletteBySheetName = {}; //TODO
          return;
        }
        const palette: RefPaletteType = {};
        const paletteBySheetName: { [sheetName: string]: RefPaletteType } = {};
        const lexer = new Lexer(inputting.substring(1));
        lexer.tokenize();

        let i = 0;
        for (const token of lexer.tokens) {
          if (token.type === "REF" || token.type === "RANGE") {
            const normalizedRef = stripAddressAbsolute(token.stringify());
            const splitterIndex = normalizedRef.indexOf("!");
            if (splitterIndex !== -1) {
              const sheetName = normalizedRef.substring(0, splitterIndex);
              const ref = normalizedRef.substring(splitterIndex + 1);
              const stripped = stripSheetName(sheetName);
              const upperRef = ref.toUpperCase();
              if (paletteBySheetName[stripped] == null) {
                paletteBySheetName[stripped] = {};
              }
              if (paletteBySheetName[stripped][upperRef] == null) {
                paletteBySheetName[stripped][upperRef] = i++;
              }
            } else {
              const upperRef = normalizedRef.toUpperCase();
              if (palette[upperRef] == null) {
                palette[upperRef] = i++;
              }
            }
          }
        }
        setPalette(palette);
        table.wire.paletteBySheetName = paletteBySheetName;
      },
    ),
  );

  createEffect(
    on(
      () => [choosing()],
      () => {
        if (!table) {
          return;
        }
        table.wire.choosingAddress = p2a(choosing());
        tabularRef.focus();
      },
    ),
  );

  onMount(() => {
    //tabularRef.focus();
    if (!table) {
      return;
    }

    dispatch(setStore({ tabularRef: tabularRef }));
    setVirtualized(virtualize(table, tabularRef));
    tabularRef.focus();
    tabularRef.focus();
  });

  /*
 createEffect(() => {
    if (!table) {
      return;
    }
    const formulaEditing = editingAddress && inputting.startsWith("=");
    if (!formulaEditing) {
      setPalette({});
      table.wire.paletteBySheetName = {};
      return;
    }
    const palette: RefPaletteType = {};
    const paletteBySheetName: { [sheetName: string]: RefPaletteType } = {};
    const lexer = new Lexer(inputting.substring(1));
    lexer.tokenize();

    let i = 0;
    for (const token of lexer.tokens) {
      if (token.type === "REF" || token.type === "RANGE") {
        const normalizedRef = stripAddressAbsolute(token.stringify());
        const splitterIndex = normalizedRef.indexOf("!");
        if (splitterIndex !== -1) {
          const sheetName = normalizedRef.substring(0, splitterIndex);
          const ref = normalizedRef.substring(splitterIndex + 1);
          const stripped = stripSheetName(sheetName);
          const upperRef = ref.toUpperCase();
          if (paletteBySheetName[stripped] == null) {
            paletteBySheetName[stripped] = {};
          }
          if (paletteBySheetName[stripped][upperRef] == null) {
            paletteBySheetName[stripped][upperRef] = i++;
          }
        } else {
          const upperRef = normalizedRef.toUpperCase();
          if (palette[upperRef] == null) {
            palette[upperRef] = i++;
          }
        }
      }
    }
    setPalette(palette);
    table.wire.paletteBySheetName = paletteBySheetName;
  });

 createEffect(() => {
    if (!table) {
      return;
    }
    table.wire.choosingAddress = p2a(choosing);
  });


  createEffect(() => {
    if (!table) {
      return;
    }
    setVirtualized(virtualize(table, tabularRef.current));
  });
*/

  let operationStyles = useOperationStyles(store, {
    ...palette(),
    ...table.wire.paletteBySheetName[table.sheetName],
  });

  const span_list: SpanElementType[] = table.spanList;

  const isSkip = (x: number, y: number) => {
    let skip = false; // default

    if (typeof span_list !== "undefined") {
      for (let i = 0; i < span_list.length; i++) {
        if (
          y > span_list[i].y &&
          y < span_list[i].y + span_list[i].row_size &&
          x >= span_list[i].x &&
          x < span_list[i].x + span_list[i].col_size
        ) {
          skip = true;
          break;
        }

        if (
          y == span_list[i].y &&
          x > span_list[i].x &&
          x < span_list[i].x + span_list[i].col_size
        ) {
          skip = true;
          break;
        }
      }
    }
    return skip;
  };

  const colSpan_size = (x: number, y: number) => {
    let _colSpan_size = 1; // default

    if (typeof span_list !== "undefined") {
      for (let i = 0; i < span_list.length; i++) {
        if (x == span_list[i].x && y == span_list[i].y) {
          if (span_list[i].col_size ?? 1 > 1) {
            _colSpan_size = span_list[i].col_size ?? 1;
          }
        }
      }
    }
    return _colSpan_size;
  };

  const rowSpan_size = (x: number, y: number) => {
    let _rowSpan_size: number = 1; // default

    if (typeof span_list !== "undefined") {
      for (let i = 0; i < span_list.length; i++) {
        if (x == span_list[i].x && y == span_list[i].y) {
          if (span_list[i].row_size ?? 1 > 1) {
            _rowSpan_size = span_list[i].row_size ?? 1;
          }
        }
      }
    }
    return _rowSpan_size;
  };

  //const freeze_point = { x:3, y:3 }

  let freeze_point = null;
  if (table.isFreeze) {
    if (table.freeze) {
      freeze_point = table.freeze;
    }
  }

  const sum_top_hight = (y: number) => {
    const tableRef = tabularRef;
    let height = 0;
    if (tableRef) {
      let ele = tableRef.querySelector("#CR");
      if (ele && ele.clientHeight) {
        height += ele?.clientHeight + 1;
      }
      for (let i = 1; i < y; i++) {
        const rowId = y2r(y);
        const id = `RH-${rowId}`;
        if (tableRef) {
          let ele = tableRef.querySelector("#" + id);
          if (ele) {
            height += ele.clientHeight + 1;
          }
        }
      }
    }
    return height;
  };

  const sum_left_width = (x: number) => {
    const tableRef = tabularRef;
    let width = 10; // 10
    if (tableRef) {
      let ele = tableRef.querySelector("#CR");
      width -= table.headerWidth;
      for (let i = 1; i <= x; i++) {
        const colId = x2c(x);
        const id = `CH-${colId}`;
        if (tableRef) {
          let ele = tableRef.querySelector("#" + id);
          if (ele) {
            width += ele?.clientWidth;
          }
        }
      }
    }
    return width;
  };

  const sum_left_top_width = (x: number) => {
    const tableRef = tabularRef;
    let width = 10; // 10
    if (tableRef) {
      let ele = tableRef.querySelector("#CR");
      //width -= ele?.clientWidth;
      width -= table.headerWidth;
      for (let i = 1; i <= x; i++) {
        const colId = x2c(x);
        const id = `CH-${colId}`;
        if (tableRef) {
          let ele = tableRef.querySelector("#" + id);
          if (ele) {
            width += ele?.clientWidth;
          }
        }
      }
    }
    return width;
  };

  const set_freeze_tr_style = (y: number) => {
    if (freeze_point && y < freeze_point.y) {
      let tophight = sum_top_hight(y);
      let style = {
        position: "sticky",
        top: `${tophight}px`,
        "z-index": 105,
        //background: "#e6e6fa",
        //background: "red",
        //border: "solid 2px blue",
      };
      if (y == freeze_point.y - 1) {
        //style["borderBottom"] = "2px solid green";
        //style["background"] = "green";
      }
      return style;
    } else {
      return {};
    }
  };

  const set_freeze_td_style = (x: number, y: number) => {
    if (freeze_point && x < freeze_point.x) {
      let leftwidth = sum_left_width(x);
      let style = {
        position: "sticky",
        left: `${leftwidth}px`,
        "z-index": 100,
        //background: "#e6e6fa",
        //background: "green",
        //borderTop: "solid #e6e6fa 0px",
        //borderBottom: "solid #e6e6fa 0px",
      };

      //if (freeze_point && y < freeze_point.y) {
      //  style["border"] = "solid #0000 1px";
      //}

      if (x == freeze_point.x - 1) {
        //style["borderRight"] = "2px solid green";
      }
      return style;
    } else {
      if (freeze_point && y < freeze_point.y) {
        let style = {
          //background: "#e6e6fa",
          //borderTop: "solid #e6e6fa 0px",
          //border: "solid yellow 2px",
        };
        return style;
      }

      return {};
    }
  };

  const set_freeze_headertop_td_style = (x: number) => {
    if (freeze_point && x < freeze_point.x) {
      let leftwidth = sum_left_top_width(x);
      let style = {
        position: "sticky",
        left: `${leftwidth}px`,
        "z-index": 200,
        //"z-index": 103,
        //background: "blue",
        //borderRight: "",
        //border: "solid blue 1px",
      };
      if (x == freeze_point.x - 1) {
        //style["borderRight"] = "2px solid green";
      }
      return style;
    } else {
      return {};
    }
  };

  const is_freeze_y = (y: number) => {
    if (freeze_point && y < freeze_point.y) {
      return true;
    } else {
      return false;
    }
  };

  const is_freeze_x = (x: number) => {
    if (freeze_point && x < freeze_point.x) {
      return true;
    } else {
      return false;
    }
  };

  const handleKeyDown = (e: EditorEventWithNativeEvent) => {
    //console.log("Tabular:handleKeyDown", e.key);
    e.preventDefault(); // Prevents the default page scroll
    e.stopPropagation();

    switch (e.key) {
      case "ArrowLeft": // LEFT
        dispatch(
          arrow({
            //shiftKey,
            shiftKey: false, //shiftKey,
            numRows: table.getNumRows(),
            numCols: table.getNumCols(),
            deltaY: 0,
            deltaX: -1,
          }),
        );
        //setVirtualized(virtualize(table, tabularRef));
        //return false
        break;
      case "ArrowRight": // RIGHT
        dispatch(
          arrow({
            //shiftKey,
            shiftKey: false, //shiftKey,
            numRows: table.getNumRows(),
            numCols: table.getNumCols(),
            deltaY: 0,
            deltaX: 1,
          }),
        );
        //return false;
        //setVirtualized(virtualize(table, tabularRef));
        break;
      case "ArrowUp": // UP
        dispatch(
          arrow({
            //shiftKey,
            shiftKey: false, //shiftKey,
            numRows: table.getNumRows(),
            numCols: table.getNumCols(),
            deltaY: -1,
            deltaX: 0,
          }),
        );
        //return false;
        //setVirtualized(virtualize(table, tabularRef));
        break;
      case "ArrowDown": // DOWN
        dispatch(
          arrow({
            //shiftKey,
            shiftKey: false, //shiftKey,
            numRows: table.getNumRows(),
            numCols: table.getNumCols(),
            deltaY: 1,
            deltaX: 0,
          }),
        );
        //return false;
        //setVirtualized(virtualize(table, tabularRef));
        break;
      case "PageDown": // DOWN
        pageDown = true;
        break;
      case "PageUp": // DOWN
        pageUp = true;
        break;
    }
    return true;
  };

  const handleKeyUp = (e: EditorEventWithNativeEvent) => {
    //console.log("Tabular:handleKeyUp", e.key);
    switch (e.key) {
      case "PageDown": // DOWN
        pageDown = false;
        break;
      case "PageUp": // DOWN
        pageUp = false;
        break;
    }
  };

  let pageUp = false;
  let pageDown = false;
  let pointerDown = false;

  const handlePointerDown = (event: PointerEvent) => {
    pointerDown = true;
  };

  const handlePointerUp = (event: PointerEvent) => {
    pointerDown = false;
  };

  window.addEventListener("pointerup", handlePointerUp);

  return (
    <>
      {/*<For each={key()}>{() => */}
      <div
        class="gs-tabular"
	id={ gsid + "_Tabular" }
/*
        style={{
          width: (sheetWidth === -1 ? undefined : sheetWidth) + "px",
          height: (sheetHeight === -1 ? undefined : sheetHeight) + "px",
        }}
*/
      
        style={{
          width: "100%",
          height: "100%",
        }}

        ref={tabularRef}
        onMouseMove={handleMouseMove}
        onScroll={handleScroll}
        onPointerDown={handlePointerDown}
        onWheel={handleWheel}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        tabindex="0"
        //  onKeyDown={handleKeyDown}
      >
        <div
          class={"gs-tabular-inner"}
          style={{
            width: table.totalWidth + 1 + "px",
            height: table.totalHeight + 1 + "px",
          }}
        >
          <For each={tablekey()}>
            {() => (
              <table
                ref={tableRef}
                class={`gs-table`}
                tabindex="0"
                //onKeyDown={handleKeyDown}
                onMouseDown={handleDragStart} //NEW
                onFocus={handleFocus}
              >
                <thead class="gs-thead" style={{ height: table.headerHeight }}>
                  <tr class="gs-row">
                    <th
                      id="CR"
                      class="gs-th gs-th-left gs-th-top header_freeze_x"
                      style={{
                        position: "sticky",
                        width: table.headerWidth + "px",
                        height: table.headerHeight + "px",
                        "z-index": 200,
                      }}
                      onClick={handleSelectAllClick}
                    >
                      <div class="gs-th-inner">
                        <ScrollHandle
                          class={
                            leftHeaderSelecting || topHeaderSelecting
                              ? "gs-hidden"
                              : ""
                          }
                          style={{ position: "absolute" }}
                          horizontal={leftHeaderSelecting ? 0 : -1}
                          vertical={topHeaderSelecting ? 0 : -1}
                        />
                      </div>
                    </th>

                    <th
                      class="gs-adjuster gs-adjuster-horizontal gs-adjuster-horizontal-left"
                      style={{
                        width: (virtualized()?.adjuster?.left ?? 1) + "px",
                      }}
                    ></th>

                    <For each={virtualized()?.xs}>
                      {(x, index) => {
                        return (
                          <HeaderCellTop
                            x={x}
                            isFreeze={is_freeze_x(x)}
                            freezeStyle={set_freeze_headertop_td_style(x)}
                          />
                        );
                      }}
                    </For>

                    <th
                      class="gs-adjuster gs-adjuster-horizontal gs-adjuster-horizontal-right"
                      style={{ width: virtualized()?.adjuster?.right + "px" }}
                    ></th>
                  </tr>
                </thead>

                <tbody class="gs-table-body-adjuster">
                  <tr class="gs-row">
                    <th
                      class={`gs-adjuster gs-adjuster-horizontal gs-adjuster-vertical`}
                      style={{
                        height: (virtualized()?.adjuster?.top ?? 1) + "px",
                      }}
                    ></th>
                    <td class="gs-adjuster gs-adjuster-vertical"></td>

                    <For each={virtualized()?.xs}>
                      {(x, index) => {
                        <td class="gs-adjuster gs-adjuster-vertical"></td>;
                      }}
                    </For>

                    <th
                      class={`gs-adjuster gs-adjuster-horizontal gs-adjuster-vertical`}
                    ></th>
                  </tr>
                </tbody>

                <tbody class="gs-table-body-data">
                  <For each={virtualized()?.ys}>
                    {(y, index) => (
                      <tr class="gs-row" style={set_freeze_tr_style(y)}>
                        <HeaderCellLeft y={y} isFreeze={is_freeze_y(y)} />

                        <td class="gs-adjuster gs-adjuster-horizontal gs-adjuster-horizontal-left" />

                        <For each={virtualized()?.xs}>
                          {(x, index) => {
                            if (isSkip(x, y)) {
                              //return <></>;
                              return;
                            }

                            return (
                              <For each={key()}>
                                {() => (
                                  <Cell
                                    y={y}
                                    x={x}
                                    freeze_y={is_freeze_y(y) ? true : false}
                                    freeze_x={is_freeze_x(x) ? true : false}
                                    freezeStyle={set_freeze_td_style(x, y)}
                                    colSpan_size={colSpan_size(x, y)}
                                    rowSpan_size={rowSpan_size(x, y)}
                                    operationStyle={
                                      operationStyles[
                                        p2a({
                                          y: y,
                                          x: x,
                                        })
                                      ]
                                    }
                                  />
                                )}
                              </For>
                            );
                          }}
                        </For>

                        <td class="gs-adjuster gs-adjuster-horizontal gs-adjuster-horizontal-right" />
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>
            )}
          </For>
        </div>
      </div>
      {/*  }</For> */}
    </>
  );
};

const BORDER_POINTED = "solid 2px #0077ff";
const BORDER_SELECTED = "solid 1px #0077ff";
const BORDER_CUTTING = "dotted 2px #0077ff";
const BORDER_COPYING = "dashed 2px #0077ff";
const SEARCH_MATCHING_BACKGROUND = "rgba(0,200,100,.2)";
const SEARCH_MATCHING_BORDER = "solid 2px #00aa78";
const AUTOFILL_BORDER = "dashed 1px #444444";

const useOperationStyles = (store: StoreType, refs: RefPaletteType) => {
  const cellStyles: { [key: string]: React.CSSProperties } = {};
  const updateStyle = (point: PointType, style: React.CSSProperties) => {
    const address = p2a(point);
    cellStyles[address] = cellStyles[address] || {};
    Object.assign(cellStyles[address], style);
  };
  const {
    choosing,
    selectingZone,
    matchingCells,
    matchingCellIndex,
    tableReactive,
    autofillDraggingTo,
    editingAddress,
  } = store();

  const table = tableReactive;
  //console.log(table);
  if (!table) {
    return {};
  }
  const { wire } = table;

  const { copyingSheetId, copyingZone, cutting } = wire;
  const editingAnywhere = !!(wire.editingAddress || editingAddress);

  {
    // selecting
    const { top, left, bottom, right } = zoneToArea(selectingZone);

    if (!editingAnywhere) {
      for (let y = top; y <= bottom; y++) {
        updateStyle({ y, x: left - 1 }, { "border-right": BORDER_SELECTED });
        updateStyle({ y, x: left }, { "border-left": BORDER_SELECTED });
        updateStyle({ y, x: right }, { "border-right": BORDER_SELECTED });
        updateStyle({ y, x: right + 1 }, { "border-left": BORDER_SELECTED });
      }
      for (let x = left; x <= right; x++) {
        updateStyle({ y: top - 1, x }, { "border-bottom": BORDER_SELECTED });
        updateStyle({ y: top, x }, { "border-top": BORDER_SELECTED });
        updateStyle({ y: bottom, x }, { "border-bottom": BORDER_SELECTED });
        updateStyle({ y: bottom + 1, x }, { "border-top": BORDER_SELECTED });
      }
    }
  }
  if (autofillDraggingTo) {
    const autofill = new Autofill(store(), autofillDraggingTo);
    const { top, left, bottom, right } = autofill.wholeArea;
    for (let y = top; y <= bottom; y++) {
      updateStyle({ y, x: left - 1 }, { "border-right": AUTOFILL_BORDER });
      updateStyle({ y, x: left }, { "border-left": AUTOFILL_BORDER });
      updateStyle({ y, x: right }, { "border-right": AUTOFILL_BORDER });
      updateStyle({ y, x: right + 1 }, { "border-left": AUTOFILL_BORDER });
    }
    for (let x = left; x <= right; x++) {
      updateStyle({ y: top - 1, x }, { "border-bottom": AUTOFILL_BORDER });
      updateStyle({ y: top, x }, { "border-top": AUTOFILL_BORDER });
      updateStyle({ y: bottom, x }, { "border-bottom": AUTOFILL_BORDER });
      updateStyle({ y: bottom + 1, x }, { "border-top": AUTOFILL_BORDER });
    }
  }
  {
    // choosing

    const { y, x } = choosing;
    updateStyle(
      { y, x },
      {
        "border-left": BORDER_POINTED,
        "border-right": BORDER_POINTED,
        "border-top": BORDER_POINTED,
        "border-bottom": BORDER_POINTED,
      },
    );
    //updateStyle({ y, x: x - 1 }, { "border-right": BORDER_POINTED });  //GUSA
    //updateStyle({ y, x: x + 1 }, { "border-left": BORDER_POINTED });  //GUSA
    //updateStyle({ y: y - 1, x }, { "border-bottom": BORDER_POINTED }); //GUSA
    //updateStyle({ y: y + 1, x }, { "border-top": BORDER_POINTED });  //GUSA
  }

  if (table.sheetId === copyingSheetId) {
    // copying
    const borderStyle = cutting ? BORDER_CUTTING : BORDER_COPYING;
    const { top, left, bottom, right } = zoneToArea(copyingZone);
    for (let y = top; y <= bottom; y++) {
      updateStyle({ y, x: left - 1 }, { "border-bight": borderStyle });
      updateStyle({ y, x: left }, { "border-left": borderStyle });
      updateStyle({ y, x: right }, { "border-right": borderStyle });
      updateStyle({ y, x: right + 1 }, { "border-left": borderStyle });
    }
    for (let x = left; x <= right; x++) {
      updateStyle({ y: top - 1, x }, { "border-bottom": borderStyle });
      updateStyle({ y: top, x }, { "border-top": borderStyle });
      updateStyle({ y: bottom, x }, { "border-bottom": borderStyle });
      updateStyle({ y: bottom + 1, x }, { "border-top": borderStyle });
    }
  }

  Object.entries(refs).forEach(([ref, i]) => {
    const palette = COLOR_PALETTE[i % COLOR_PALETTE.length];
    const borderStyle = `dashed 2px ${palette}`;
    const { top, left, bottom, right } = table.rangeToArea(ref);
    for (let y = top; y <= bottom; y++) {
      updateStyle({ y, x: left - 1 }, { "border-right": borderStyle });
      updateStyle({ y, x: left }, { "border-left": borderStyle });
      updateStyle({ y, x: right }, { "border-right": borderStyle });
      updateStyle({ y, x: right + 1 }, { "border-left": borderStyle });
    }
    for (let x = left; x <= right; x++) {
      updateStyle({ y: top - 1, x }, { "border-bottom": borderStyle });
      updateStyle({ y: top, x }, { "border-top": borderStyle });
      updateStyle({ y: bottom, x }, { "border-bottom": borderStyle });
      updateStyle({ y: bottom + 1, x }, { "border-top": borderStyle });
    }
  });
  matchingCells.forEach((address) => {
    const { y, x } = a2p(address);
    updateStyle({ y, x }, { backgroundColor: SEARCH_MATCHING_BACKGROUND });
  });
  if (matchingCells.length > 0) {
    const { y, x } = a2p(matchingCells[matchingCellIndex]);
    updateStyle(
      { y, x },
      {
        "border-left": SEARCH_MATCHING_BORDER,
        "border-right": SEARCH_MATCHING_BORDER,
        "border-top": SEARCH_MATCHING_BORDER,
        "border-bottom": SEARCH_MATCHING_BORDER,
      },
    );
    updateStyle({ y, x: x - 1 }, { "border-right": SEARCH_MATCHING_BORDER });
    updateStyle({ y, x: x + 1 }, { "border-left": SEARCH_MATCHING_BORDER });
    updateStyle({ y: y - 1, x }, { "border-bottom": SEARCH_MATCHING_BORDER });
    updateStyle({ y: y + 1, x }, { "border-top": SEARCH_MATCHING_BORDER });
  }
  return cellStyles;
};
