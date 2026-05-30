import { Table } from "../react-core/src/lib/table";
//import { GridSheet, GridSheetPassive, useHub, makeBorder, type HubProps, Renderer, CheckboxRendererMixin, ThousandSeparatorRendererMixin } from "../react-core/src/index";

import {
  GridSheetPassive,
  useHub,
  makeBorder,
  type HubProps,
  Renderer,
  CheckboxRendererMixin,
  ThousandSeparatorRendererMixin,
} from "../react-core/src/index";

import type { CellsByAddressType } from "../react-core/src/types";
import { createSignal, createEffect, on, mergeProps } from "solid-js";

function colNumToId(colNum: number): string {
  let columnName = "";
  while (colNum > 0) {
    let modulo = (colNum - 1) % 26;
    columnName = String.fromCharCode(65 + modulo) + columnName;
    colNum = Math.floor((colNum - modulo) / 26);
  }
  return columnName;
}

//const App: React.FC = () => {
const App = () => {
  const [enableDecimalLabeler, setEnableDecimalLabeler] = createSignal(false);

  const hubProps: HubProps = {
    renderers: {
      checkbox: new Renderer({ mixins: [CheckboxRendererMixin] }),
      thousand_separator: new Renderer({
        mixins: [ThousandSeparatorRendererMixin],
      }),
    },
    labelers: {},
    onInit: ({ table }) => {
      console.log(`Table initialized: ${table.sheetName}`);
    },
  };
  //console.log(hubProps);
  const hub = useHub(hubProps);
  //console.log("hub", hub)

  createEffect(
    on(
      () => [enableDecimalLabeler()],
      () => {
        hubProps.labelers!.decimal = enableDecimalLabeler()
          ? (n: number) => String(n)
          : null;
        hub().wire.transmit(hubProps);
      },
    ),
  );

  let cells: CellsByAddressType = {};
  //console.log("Table max col:", colNumToId(139));
  for (let rowNum = 1; rowNum < 1000; rowNum++) {
    for (let colNum = 1; colNum < 100; colNum++) {
      const columnName = colNumToId(colNum);
      const cellName = columnName + String(rowNum);
      //console.log(cellName);
      cells[cellName] = { value: cellName };
    }
  }
  /*
                style: {
                  backgroundColor: "#ccff99",
          }
  */
  /*
    let spans = {
       E5:  {colsize: 2            },
       C10: {            rowsize: 2},
       F12: {colsize: 3, rowsize: 3},
    }
  */

  //                ...makeBorder({
  let spans: CellsByAddressType = {
    E5: { colsize: 2, style: { "background-color": "#ffff99" } },
    E6: { colsize: 3, style: { "background-color": "#ffff99" } },
    I5: { rowsize: 2, style: { "background-color": "#ffff99" } },
    J5: { rowsize: 3, style: { "background-color": "#ffff99" } },
    C10: { rowsize: 2, style: { "background-color": "#99ccff" } },
    D18: { rowsize: 2, colsize: 2, style: { "background-color": "#99ccff" } },
    //F12: {colsize: 3, rowsize: 3, style:{ "background-color": "#ffccff", border:"solid red 2px"}},
    F12: {
      colsize: 3,
      rowsize: 3,
      style: {
        "background-color": "#ffccff",
        //"background-color": "red",
        border: "solid red 2px",
        /*
                ...makeBorder({
                    bottom: "solid red 5px",
                    top: "solid red 5px",
                    left: "solid red 5px",
                    right: "solid red 5px",
                }),
*/
      },
    },
  };

  for (const key in spans) {
    //console.log(key, spans[key]);
    Object.assign(cells[key], spans[key]);
  }

  /*
   default by  ../constants.ts
  
  SHEET_HEIGHT = 500;
  SHEET_WIDTH = 1000;
  
  DEFAULT_HEIGHT = 24;
  DEFAULT_WIDTH = 90;
  
  HEADER_HEIGHT = 24;
  HEADER_WIDTH = 50;
  */

  cells["default"] = {
    // cell size
    width: 90,
    height: 24,
    style: { fontSize: "14px" },
    default: { labeler: "decimal" },
  };

  cells["0"] = {
    height: 24, // CR   table.headerHeight
    width: 50, // CR  table.headerWidth
    //default HEADER_HEIGHT = 24;
    //default HEADER_WIDTH = 50;

    //freeze: "C3",
    //freeze : 'C5',
    //freeze : 'D3',
    //freeze : 'B2',
  };

  cells["E4"] = {
    value: "OK",
    style: {
      "background-image": 'url(\"./top2bottom.svg\")',
      "background-repeat": "no-repeat" /* 繰り返さない */,
      "background-size": "cover",
      /* 要素全体を覆うように拡大縮小（はみ出しは隠す） */ "background-position":
        "center" /* 中央に配置 */,
    },
  };
  cells["C4"] = {
    value: "OK",
    style: {
      "background-image": 'url(\"./bottom2top.svg\")',
      "background-repeat": "no-repeat",
      "background-size": "cover",
    },
  };

  const r = "30";
  const color = "green";
  const svgdata = `
     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
         <circle cx="50" cy="50" r="${r}" stroke="black" stroke-width="3" fill="${color}"/>
     </svg>
     `;

  const svgdata_enc = encodeURIComponent(svgdata);

  const image2 = "url(\'data:image/svg+xml, " + svgdata_enc + "\')";

  cells["G9"] = {
    style: {
      "background-image": image2,
      "background-repeat": "no-repeat",
      "background-size": "cover",
    },
  };

  const { wire } = hub();

  let minNumRows = 1;
  let maxNumRows = -1;
  let minNumCols = 1;
  let maxNumCols = -1;
  let sheetName = "Sheet1";

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

  const [table, setTable] = createSignal(
    new Table({
      minNumRows,
      maxNumRows,
      minNumCols,
      maxNumCols,
      sheetName,
      hub: wire,
    }),
  );

  createEffect(() => {
    console.log("update Table: ", table());
  });
  createEffect(() => {
    console.log("update hub: ", hub());
  });

  cells["9"] = { height: 80 };
  cells["D7"] = { value: "1" };
  cells["E7"] = { value: "8" };
  cells["E8"] = { value: "3" };
  cells["F7"] = { value: "=D7+E7" };
  cells["G7"] = { value: "=SUM(D7:F7)" };

  cells["D9"] = {
    value: "価格",
    style: {
      "text-align": "right",
      "vertical-align": "top",
    },
  };

  cells["E9"] = {
    value: "コード",
    style: {
      "text-align": "center",
      "vertical-align": "center",
    },
  };
  cells["F9"] = {
    value: "商品",
    style: {
      "text-align": "left",
      "vertical-align": "bottom",
    },
  };

  /*
    ((cells["D9"] = {
        value: "価格",
        style: {
            "text-align": "right",
            "vertical-align": "top",
        },
    }),
        (cells["E9"] = {
            value: "コード",
            style: {
                "text-align": "center",
                "vertical-align": "center",
            },
        }),
        (cells["F9"] = {
            value: "商品",
            style: {
                "text-align": "left",
                "vertical-align": "bottom",
            },
        }),
    */

  //cells["D7"] = { value: "1"}
  //cells["E7"] = { value: "8"}
  //cells["F7"] = { value: "=D7+E7"}
  //cells["G7"] = { value: "=SUM(D7:F7)"}

  table().initialize(cells);
  table().setTotalSize();

  //console.log(cells["E5"]);
  //console.log(cells["C10"]);
  //console.log(cells["F12"]);

  //style={{ width: 800 }}

  return (
    <main>
      <br />
      <br />
      <div class="grid-container">
        <GridSheetPassive
          hub={hub}
          table={table()}
          /*
                    initialCells={{
                      
                 // '0': {
                     //       height: 60,  // Header height
                     //       width: 180,   // Header width
                     //     },
              	
                      A1: { value: "Hello" },
                      B1: { value: "React", style: { backgroundColor: "#00bfff" } },
                      A2: { value: 123 },
                      B2: { value: 456 },
                      A3: { value: 789 },
                      C6: { value: "=SUM(A2:B2)" },
                      D7: { value: 789 },
                      E8: { value: 789 },
                      X20: { value: 789 },
                    }}
          */

          options={{
            sheetHeight: 400,
            sheetWidth: 800,
          }}
          //sheetName="Sheet1"
          sheetName={sheetName}
          //style={{ width: 800, height: 300 }}
          //
        />

        <br />
        
                <GridSheetPassive
                    hub={hub}
                    table={table()}
                    //initialCells={ cells }
                    options={
                        {}
                    }
                    sheetName="Sheet1"
                //style={{ width: 800, height: 300 }}
                />

        <br />
        {/*
                <GridSheet
                    hub={hub}
                    initialCells={{
                        default: {
                            width: 100,
                            height: 20,
                            style: { fontSize: "14px" },
                            default: { labeler: "decimal" }
                        },
                        0: {
                            height: 20,
                            width: 100
                        },
                        A4: {
                            value: "TEST",
                            colsize: 2,
                            rowsize: 2,
                            style: { backgroundColor: "#ccff99" }
                        },
                        C3: { value: "=SUM(Sheet1!A2:B3)" },
                        X20: { value: 789 },
                        get "A7:E7"() {
                            return {
                                get style() {
                                    return mergeProps(() => makeBorder({
                                        bottom: "4px double #000000",
                                    }))
                                }
                            }
                        },
                        D8: {
                            value: "abc",
                            style: {
                                backgroundColor: "#3498db",
                                color: "white",
                                fontWeight: "bold",
                                textAlign: "center"
                            }
                        },
                        A10: { style: { height: "40px" } },
                        C10: {
                            value: "製品",
                            style: {
                                textAlign: "left",
                                verticalAlign: "bottom"
                            }
                        },
                        D10: {
                            value: "コード",
                            style: {
                                textAlign: "center",
                                verticalAlign: "center"
                            }
                        },
                        E10: {
                            value: "価格",
                            style: {
                                textAlign: "right",
                                verticalAlign: "top"
                            }
                        },
                        get "C10:E10"() {
                            return {
                                get style() {
                                    return mergeProps(() => makeBorder({
                                        bottom: "4px double #000000",
                                    }))
                                }
                            }
                        },
                        get "C9:E9"() {
                            return {
                                get style() {
                                    return mergeProps(() => makeBorder({
                                        bottom: "1px solid #000000",
                                    }))
                                }
                            }
                        },
                        get "C11:E11"() {
                            return {
                                get style() {
                                    return mergeProps(() => makeBorder({
                                        bottom: "1px solid #000000",
                                    }))
                                }
                            }
                        },
                        get "C12:E12"() {
                            return {
                                get style() {
                                    return mergeProps(() => makeBorder({
                                        bottom: "1px solid #000000",
                                    }))
                                }
                            }
                        },
                        get "B10:B12"() {
                            return {
                                get style() {
                                    return mergeProps(() => makeBorder({
                                        right: "1px solid #000000",
                                    }))
                                }
                            }
                        },
                        get "C10:C12"() {
                            return {
                                get style() {
                                    return mergeProps(() => makeBorder({
                                        right: "1px solid #000000",
                                    }))
                                }
                            }
                        },
                        get "D10:D12"() {
                            return {
                                get style() {
                                    return mergeProps(() => makeBorder({
                                        right: "1px solid #000000",
                                    }))
                                }
                            }
                        },
                        get "E10:E12"() {
                            return {
                                get style() {
                                    return mergeProps(() => makeBorder({
                                        right: "1px solid #000000",
                                    }))
                                }
                            }
                        },
                        F: {
                            labeler: "Done",
                            width: 50,
                            renderer: "checkbox",
                            style: { backgroundColor: "#f8f9fa" },
                            alignItems: "center",
                            justifyContent: "center"
                        },
                        F1: { value: false },
                        F2: { value: true },
                        G: {
                            labeler: "Count",
                            width: 150,
                            renderer: "thousand_separator",
                            style: {
                                backgroundColor: "#f8f9fa",
                                textAlign: "right"
                            }
                        },
                        G1: { value: 123456789 },
                        G2: { value: 888888 }
                    }}
                    //style={{ width: 800, height: 300 }}
                    options={{}}
                    sheetName="Sheet2"
                />
*/}
      </div>
      {/* Labeler Control */}
      <div class="labeler-control">
        <label>
          <input
            type="checkbox"
            checked={enableDecimalLabeler()}
            onChange={(e) => setEnableDecimalLabeler(e.target.checked)}
          />
          Enable Decimal Labeler for Sheet2
        </label>
      </div>
    </main>
  );
};

export default App;
