import { Cell } from "./Cell";
import { HeaderCellTop } from "./HeaderCellTop";
import { HeaderCellLeft } from "./HeaderCellLeft";
import { Context } from "../store";
import { choose, select } from "../store/actions";
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
import { createEffect, on, onMount, useContext, createSignal } from "solid-js";

export const Tabular = () => {
  const [palette, setPalette] = createSignal<RefPaletteType>({});
  const { store, dispatch } = useContext(Context);
/*
  createEffect(() => {
    console.log("Tabluar store update: ", store().choosing);
  });
*/

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

const [choosing, setChoosing] = createSignal(store().choosing);

 createEffect(() => {
    setChoosing(store().choosing);
    operationStyles = useOperationStyles(store, {
      ...palette(),
      ...table.wire.paletteBySheetName[table.sheetName],
    });
    setKey([{}]);
  });

/*
 createEffect(() => {
    console.log("choosing",choosing());
  operationStyles = useOperationStyles(store, {
    ...palette(),
    ...table.wire.paletteBySheetName[table.sheetName],
  });
    setKey([{}]);

  });
*/

  //choosing = {y:3, x:3};

  //console.log("-",store()) ;
  //console.log("-", sheetHeight);
  //console.log("-",sheetWidth) ;

  const table = tableReactive;
  //console.log("table", table);

  //const tableRef = useRef<HTMLTableElement>(null);
  let tableRef = null;

  const [virtualized, setVirtualized] = createSignal<Virtualization | null>(
    null,
  );
/*
  createEffect(() => {
    console.log("virtualized: ", virtualized());
  });
*/

  const handleMouseMove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
 
    //console.log("croll");
    if (table) {
      //console.log(virtualize(table, e.currentTarget));
      setVirtualized(virtualize(table, e.currentTarget));
    }
    
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
      },
    ),
  );

/*
  createEffect(
    on(
    
      () => [
        tabularRef,
        tableReactive,
        mainRef?.clientHeight,
        mainRef?.clientWidth,
      ],
      
      () => {
        if (!table) {
          return;
        }
        setVirtualized(virtualize(table, tabularRef));
      },
    ),
  );
*/


  onMount(() => {
        if (!table) {
          return;
        }
        setVirtualized(virtualize(table, tabularRef));
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
  /*
    if (!table || !table.wire.ready) {
        return null;
    }
*/
  let operationStyles = useOperationStyles(store, {
    ...palette(),
    ...table.wire.paletteBySheetName[table.sheetName],
  });
  //console.log("operationStyles", operationStyles);
  //console.log("table", table);

  /*
    const setStyle = (x,y) => {
        if ( x == 3 && y == 3 ) {
             return "background-color: red;";
        } else {
             return "";
        }
  
    }
  */

  /*
    const span_list = [
     {  x:  5, y:  5, col_size: 2, row_size: 1 },
     {  x:  3, y: 10, col_size: 1, row_size: 2 },
     {  x:  6, y: 12, col_size: 3, row_size: 3 },
    ]
   */
  /*
    const skip_matrix = [
     // 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5
       [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], //1
       [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], //2
       [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], //3
       [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], //4
       [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], //5
       [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], //6
       [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], //7
       [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], //8
       [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], //9
       [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], //10
       [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], //11
       [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], //12
       [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], //13
  
    ];
  */
  /*
    const isSkip = (x,y) =>{
      let skip = false; // default
  
      if (typeof span_matrix !== 'undefined') {
           
      }
      return skip;
    }
  */
  /*
    const isSkip_ = (x,y) =>{
      if (typeof span_list !== 'undefined') {
          if ( x == 6 && y == 5 ) {
               return true
          } 
  
          if ( x == 3 && y == 11 ) {
               return true
          } 
  
          if (( (x == 7 || x == 8) && y == 12 ) ||
              ( (x == 6 || x == 7 || x == 8) && y == 13 ) ||
              ( (x == 6 || x == 7 || x == 8) && y == 14 ) 
             )
           {
               return true
          } 
       }
       return false
    }
  */

  /*
    let span_list = [
     {  x:  5, y:  5, col_size: 2, row_size: 1 },
     {  x:  3, y: 10, col_size: 1, row_size: 2 },
     {  x:  6, y: 12, col_size: 3, row_size: 3 },
    ]
  */

  /*
    let span_list = [];
    for (let i = 0; i < table.spanList.length; i++) {
         span_list.push(table.spanList[i]);
    }
  */

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
    //console.log("isFreeze")
    if (table.freeze) {
      freeze_point = table.freeze;
    }
  }

  const sum_top_hight = (y: number) => {
    let height = 0;
    if (tableRef) {
      let ele = tableRef.querySelector("#CR");
      if (ele && ele.clientHeight) {
        height += ele?.clientHeight + 1;
      }
      //height = table.headerHeight;
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
          //console.log(ele)
          if (ele) {
            width += ele?.clientWidth;
          }
        }
      }
    }
    //console.log(width);
    //return width-50;
    return width;
  };

  const sum_left_top_width = (x: number) => {
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
          //console.log(ele)
          if (ele) {
            width += ele?.clientWidth;
          }
        }
      }
    }
    //console.log(width);
    //return width-50;
    return width;
  };
  /*
    const sum_top_hight = (y:number) => {
          if ( y == 2) { return 50; }
          if ( y == 1) { return 25; }
    }
  
    const sum_left_width = (x:number) => {
          if ( x == 2) { return 140; }
          if ( x == 1) { return 50; }
    }
  */

  const set_freeze_tr_style = (y: number) => {
    //const rowId  = y2r(y);
    //console.log(rowId);
    if (freeze_point && y < freeze_point.y) {
      let tophight = sum_top_hight(y);
      //console.log("tophight", tophight);
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
    //const colId  = x2c(x);
    //console.log(colId);

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
    //const colId  = x2c(x);
    //console.log(colId);

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
            console.log("== w",table.headerWidth)
            console.log("== h",table.totalHeight)
            //table.headerWidth = 2500;
            table.totalHeight = 499*20/2  ; //TODO
            table.totalHeight = 499*20/1.8; //TODO


  return (
    <>
     {/*<For each={key()}>{() => */}
      <div
        class="gs-tabular"
        style={{
          width: (sheetWidth === -1 ? undefined : sheetWidth) + "px",
          height: (sheetHeight === -1 ? undefined : sheetHeight) + "px",
        }}
        ref={tabularRef}
        onMouseMove={handleMouseMove}
        onScroll={handleScroll}
      >
        <div
          class={"gs-tabular-inner"}
          style={{
            width: table.totalWidth + 1 + "px",
            height: table.totalHeight + 1 + "px",
            //width: "500px",
            //height: "400px",
          }}
        >
          <table ref={tableRef} class={`gs-table`}>
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
                  //style={{ width: virtualized()?.adjuster?.left ?? 1}}
                  style={{ width: (virtualized()?.adjuster?.left ?? 1) + "px" }} //ヨコMAX
                ></th>
                {/*
                {virtualized?.xs?.map?.((x) => <HeaderCellTop x={x} key={x} />)}
*/}
                {virtualized()?.xs?.map?.((x) => (
                  <HeaderCellTop
                    x={x}
                    isFreeze={is_freeze_x(x)}
                    freezeStyle={set_freeze_headertop_td_style(x)}
                  />
                ))}

                <th
                  class="gs-adjuster gs-adjuster-horizontal gs-adjuster-horizontal-right"
                  //style={{ width: virtualized()?.adjuster?.right }}
                  style={{ width: virtualized()?.adjuster?.right + "px" }}
                ></th>
              </tr>
            </thead>

            <tbody class="gs-table-body-adjuster">
              <tr class="gs-row">
                <th
                  class={`gs-adjuster gs-adjuster-horizontal gs-adjuster-vertical`}
                  //style={{ width: virtualized()?.adjuster?.top ?? 1}}
                  //style={{ width: (virtualized()?.adjuster?.top ?? 1) + "px" }}   //TODO
                ></th>
                <td class="gs-adjuster gs-adjuster-vertical"></td>

                {virtualized()?.xs?.map((x) => (
                  <td class="gs-adjuster gs-adjuster-vertical"></td>
                ))}

                <th
                  class={`gs-adjuster gs-adjuster-horizontal gs-adjuster-vertical`}
                ></th>
              </tr>
            </tbody>

            <tbody class="gs-table-body-data">
              {virtualized()?.ys?.map((y) => {
	        //console.log("y",y,isSkip(1,y));
                return (
                  <tr class="gs-row" style={set_freeze_tr_style(y)}>
                    <HeaderCellLeft y={y} isFreeze={is_freeze_y(y)} />

                    <td class="gs-adjuster gs-adjuster-horizontal gs-adjuster-horizontal-left" />

                    {virtualized()?.xs?.map((x) => {
                      //if ( x == 1) { console.log("ok") }
                      if (isSkip(x, y)) {
                        //return <></>;
                        return;
                      }

                      return (
     <For each={key()}>{() =>

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
      }</For>

                      );
                    })}

                    <td class="gs-adjuster gs-adjuster-horizontal gs-adjuster-horizontal-right" />
                  </tr>
                );
              })}
            </tbody>
          </table>
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
