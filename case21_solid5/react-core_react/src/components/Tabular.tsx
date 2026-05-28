import {
  useEffect,
  useContext,
  useRef,
  useState,
  createRef,
  useCallback,
} from "react";
import type { RefObject } from "react";

import { Cell } from "./Cell";
import { HeaderCellTop } from "./HeaderCellTop";
import { HeaderCellLeft } from "./HeaderCellLeft";

import { Context } from "../store";
import { choose, select, updateTable } from "../store/actions";

import type {
  RefPaletteType,
  PointType,
  StoreType,
  Connector,
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

export const Tabular = () => {
  const [palette, setPalette] = useState<RefPaletteType>({});
  const { store, dispatch } = useContext(Context);
  const {
    tableReactive,
    choosing,
    editingAddress,
    tabularRef,
    mainRef,
    sheetWidth,
    sheetHeight,
    inputting,
    leftHeaderSelecting,
    topHeaderSelecting,
  } = store;

  const table = tableReactive.current;

  const tableRef = useRef<HTMLTableElement>(null);

  const [virtualized, setVirtualized] = useState<Virtualization | null>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      if (table) {
        setVirtualized(virtualize(table, e.currentTarget));
      }
    },
    [tableReactive],
  );

  const handleSelectAllClick = useCallback(() => {
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
  }, [tableReactive]);

  useEffect(() => {
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
  }, [store.inputting, store.editingAddress, tableReactive]);

  useEffect(() => {
    if (!table) {
      return;
    }
    table.wire.choosingAddress = p2a(choosing);
  }, [choosing]);


  useEffect(() => {
    if (!table) {
      return;
    }
    setVirtualized(virtualize(table, tabularRef.current));
  }, [
    tabularRef.current,
    tableReactive,
    mainRef.current?.clientHeight,
    mainRef.current?.clientWidth,
  ]);


  if (!table || !table.wire.ready) {
    return null;
  }

  const operationStyles = useOperationStyles(store, {
    ...palette,
    ...table.wire.paletteBySheetName[table.sheetName],
  });

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
    if (tableRef.current) {
      let ele = tableRef.current.querySelector("#CR");
      if (ele && ele.clientHeight) {
         height += ele?.clientHeight+ 1;
      }
      //height = table.headerHeight;
      for (let i = 1; i < y; i++) {
        const rowId = y2r(y);
        const id = `RH-${rowId}`;
        if (tableRef.current) {
          let ele = tableRef.current.querySelector("#" + id);
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
    if (tableRef.current) {
      let ele = tableRef.current.querySelector("#CR");
      //width -= ele?.clientWidth;
      width -= table.headerWidth;
      for (let i = 1; i <= x; i++) {
        const colId = x2c(x);
        const id = `CH-${colId}`;
        if (tableRef.current) {
          let ele = tableRef.current.querySelector("#" + id);
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
    if (tableRef.current) {
      let ele = tableRef.current.querySelector("#CR");
      //width -= ele?.clientWidth;
      width -= table.headerWidth;
      for (let i = 1; i <= x; i++) {
        const colId = x2c(x);
        const id = `CH-${colId}`;
        if (tableRef.current) {
          let ele = tableRef.current.querySelector("#" + id);
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
        top: `${tophight }px`,
        zIndex: 105,
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

  const set_freeze_td_style = (x: number,y: number ) => {
    //const colId  = x2c(x);
    //console.log(colId);

    if (freeze_point && x < freeze_point.x) {
      let leftwidth = sum_left_width(x);
      let style = {
        position: "sticky",
        left: `${leftwidth}px`,
        zIndex: 100,
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
         return style
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
        zIndex: 200,
        //zIndex: 103,
        //background: "blue",
        //borderRight: "",
        //border: "solid blue 1px",
      };
      if (x == freeze_point.x - 1) {
        //style["borderRight"] = "2px solid green";
      }
      return style;
    } else {
      return {
      };
    }
  };

  const is_freeze_y = (y: number ) => {
      if (freeze_point && y < freeze_point.y) {
             return true;
      } else {
             return false;
      }
  }
  const is_freeze_x = (x: number ) => {
      if (freeze_point && x < freeze_point.x) {
             return true;
      } else {
             return false;
      }
  }

  return (
    <>
      <div
        className="gs-tabular"
        style={{
          width: sheetWidth === -1 ? undefined : sheetWidth,
          height: sheetHeight === -1 ? undefined : sheetHeight,
        }}
        ref={tabularRef}
        onMouseMove={handleMouseMove}
        onScroll={handleScroll}
      >
        <div
          className={"gs-tabular-inner"}
          style={{
            width: table.totalWidth + 1,
            height: table.totalHeight + 1,
          }}
        >
          <table ref={tableRef} className={`gs-table`}>
            <thead className="gs-thead" style={{ height: table.headerHeight}}>
              <tr className="gs-row" >
                <th
                  id="CR"
                  className="gs-th gs-th-left gs-th-top header_freeze_x"
                  style={{
                    position: "sticky",
                    width: table.headerWidth,
                    height: table.headerHeight,
                    //background: "white",
                    //border: "solid 1px red",
                    zIndex: 200,
                  }}
                  onClick={handleSelectAllClick}
                >
                  <div className="gs-th-inner">
                    <ScrollHandle
                      className={
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
                  className="gs-adjuster gs-adjuster-horizontal gs-adjuster-horizontal-left"
                  style={{ width: virtualized?.adjuster?.left ?? 1 }}
                ></th>
                {/*
                {virtualized?.xs?.map?.((x) => <HeaderCellTop x={x} key={x} />)}
*/}
                {virtualized?.xs?.map?.((x) => (
                  <HeaderCellTop
                    x={x}
                    key={x}
		    isFreeze={is_freeze_x(x)}
                    freezeStyle={set_freeze_headertop_td_style(x)}
                  />
                ))}

                <th
                  className="gs-adjuster gs-adjuster-horizontal gs-adjuster-horizontal-right"
                  style={{ width: virtualized?.adjuster?.right }}
                ></th>
              </tr>
            </thead>

            <tbody className="gs-table-body-adjuster">
              <tr className="gs-row">
                <th
                  className={`gs-adjuster gs-adjuster-horizontal gs-adjuster-vertical`}
                  style={{ height: virtualized?.adjuster?.top ?? 1 }}
                ></th>
                <td className="gs-adjuster gs-adjuster-vertical"></td>

                {virtualized?.xs?.map((x) => (
                  <td className="gs-adjuster gs-adjuster-vertical" key={x}></td>
                ))}

                <th
                  className={`gs-adjuster gs-adjuster-horizontal gs-adjuster-vertical`}
                ></th>
              </tr>
            </tbody>

            <tbody className="gs-table-body-data">
              {virtualized?.ys?.map((y) => {
                return (
                  <tr key={y} className="gs-row" style={set_freeze_tr_style(y)}>
                    <HeaderCellLeft y={y} 
		        isFreeze={is_freeze_y(y)}
		    />

                    <td className="gs-adjuster gs-adjuster-horizontal gs-adjuster-horizontal-left" />
                    {/*
                    {virtualized?.xs?.map((x) => (
                      <Cell key={x} y={y} x={x} operationStyle={operationStyles[p2a({ y, x })]} />
                    ))}
*/}

                    {/*
                    {virtualized?.xs?.map((x) => (
                      <Cell key={x} y={y} x={x} colSpan_size={colSpan_size(x,y)} rowSpan_size={rowSpan_size(x,y)} operationStyle={operationStyles[p2a({ y, x })]} />
                    ))}
*/}

                    {virtualized?.xs?.map((x) => {
                      if (isSkip(x, y)) {
                        //return <></>;
                        return
                      }

                      return (
                        <Cell
                          key={x}
                          y={y}
                          x={x}
			  freeze_y={is_freeze_y(y) ? true : false}
			  freeze_x={is_freeze_x(x) ? true : false}
                          freezeStyle={set_freeze_td_style(x,y)}
                          colSpan_size={colSpan_size(x, y)}
                          rowSpan_size={rowSpan_size(x, y)}
                          operationStyle={operationStyles[p2a({ y, x })]}
                        />
                      );
                    })}

                    <td className="gs-adjuster gs-adjuster-horizontal gs-adjuster-horizontal-right" />
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
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
  } = store;
  const table = tableReactive.current;
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
        updateStyle({ y, x: left - 1 }, { borderRight: BORDER_SELECTED });
        updateStyle({ y, x: left }, { borderLeft: BORDER_SELECTED });
        updateStyle({ y, x: right }, { borderRight: BORDER_SELECTED });
        updateStyle({ y, x: right + 1 }, { borderLeft: BORDER_SELECTED });
      }
      for (let x = left; x <= right; x++) {
        updateStyle({ y: top - 1, x }, { borderBottom: BORDER_SELECTED });
        updateStyle({ y: top, x }, { borderTop: BORDER_SELECTED });
        updateStyle({ y: bottom, x }, { borderBottom: BORDER_SELECTED });
        updateStyle({ y: bottom + 1, x }, { borderTop: BORDER_SELECTED });
      }
    }
  }
  if (autofillDraggingTo) {
    const autofill = new Autofill(store, autofillDraggingTo);
    const { top, left, bottom, right } = autofill.wholeArea;
    for (let y = top; y <= bottom; y++) {
      updateStyle({ y, x: left - 1 }, { borderRight: AUTOFILL_BORDER });
      updateStyle({ y, x: left }, { borderLeft: AUTOFILL_BORDER });
      updateStyle({ y, x: right }, { borderRight: AUTOFILL_BORDER });
      updateStyle({ y, x: right + 1 }, { borderLeft: AUTOFILL_BORDER });
    }
    for (let x = left; x <= right; x++) {
      updateStyle({ y: top - 1, x }, { borderBottom: AUTOFILL_BORDER });
      updateStyle({ y: top, x }, { borderTop: AUTOFILL_BORDER });
      updateStyle({ y: bottom, x }, { borderBottom: AUTOFILL_BORDER });
      updateStyle({ y: bottom + 1, x }, { borderTop: AUTOFILL_BORDER });
    }
  }
  {
    // choosing

    const { y, x } = choosing;
    updateStyle(
      { y, x },
      {
        borderLeft: BORDER_POINTED,
        borderRight: BORDER_POINTED,
        borderTop: BORDER_POINTED,
        borderBottom: BORDER_POINTED,
      },
    );
    //updateStyle({ y, x: x - 1 }, { borderRight: BORDER_POINTED });  //GUSA
    //updateStyle({ y, x: x + 1 }, { borderLeft: BORDER_POINTED });  //GUSA
    //updateStyle({ y: y - 1, x }, { borderBottom: BORDER_POINTED }); //GUSA
    //updateStyle({ y: y + 1, x }, { borderTop: BORDER_POINTED });  //GUSA
  }
  if (table.sheetId === copyingSheetId) {
    // copying
    const borderStyle = cutting ? BORDER_CUTTING : BORDER_COPYING;
    const { top, left, bottom, right } = zoneToArea(copyingZone);
    for (let y = top; y <= bottom; y++) {
      updateStyle({ y, x: left - 1 }, { borderRight: borderStyle });
      updateStyle({ y, x: left }, { borderLeft: borderStyle });
      updateStyle({ y, x: right }, { borderRight: borderStyle });
      updateStyle({ y, x: right + 1 }, { borderLeft: borderStyle });
    }
    for (let x = left; x <= right; x++) {
      updateStyle({ y: top - 1, x }, { borderBottom: borderStyle });
      updateStyle({ y: top, x }, { borderTop: borderStyle });
      updateStyle({ y: bottom, x }, { borderBottom: borderStyle });
      updateStyle({ y: bottom + 1, x }, { borderTop: borderStyle });
    }
  }

  Object.entries(refs).forEach(([ref, i]) => {
    const palette = COLOR_PALETTE[i % COLOR_PALETTE.length];
    const borderStyle = `dashed 2px ${palette}`;
    const { top, left, bottom, right } = table.rangeToArea(ref);
    for (let y = top; y <= bottom; y++) {
      updateStyle({ y, x: left - 1 }, { borderRight: borderStyle });
      updateStyle({ y, x: left }, { borderLeft: borderStyle });
      updateStyle({ y, x: right }, { borderRight: borderStyle });
      updateStyle({ y, x: right + 1 }, { borderLeft: borderStyle });
    }
    for (let x = left; x <= right; x++) {
      updateStyle({ y: top - 1, x }, { borderBottom: borderStyle });
      updateStyle({ y: top, x }, { borderTop: borderStyle });
      updateStyle({ y: bottom, x }, { borderBottom: borderStyle });
      updateStyle({ y: bottom + 1, x }, { borderTop: borderStyle });
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
        borderLeft: SEARCH_MATCHING_BORDER,
        borderRight: SEARCH_MATCHING_BORDER,
        borderTop: SEARCH_MATCHING_BORDER,
        borderBottom: SEARCH_MATCHING_BORDER,
      },
    );
    updateStyle({ y, x: x - 1 }, { borderRight: SEARCH_MATCHING_BORDER });
    updateStyle({ y, x: x + 1 }, { borderLeft: SEARCH_MATCHING_BORDER });
    updateStyle({ y: y - 1, x }, { borderBottom: SEARCH_MATCHING_BORDER });
    updateStyle({ y: y + 1, x }, { borderTop: SEARCH_MATCHING_BORDER });
  }
  return cellStyles;
};
