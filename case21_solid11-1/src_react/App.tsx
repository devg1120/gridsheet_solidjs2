import React, { useState, useEffect } from "react";
//import { GridSheet, useHub, type HubProps } from '@gridsheet/react-core';

import { Table } from "../react-core/src/lib/table";

import {
  GridSheet,
  GridSheetPassive,
  useHub,
  makeBorder,
  type HubProps,
  Renderer,
  CheckboxRendererMixin,
  ThousandSeparatorRendererMixin,
} from "../react-core/src/index";

import type { CellsByAddressType } from "../react-core/src/types";

function colNumToId(colNum: number): string {
  let columnName = "";
  while (colNum > 0) {
    let modulo = (colNum - 1) % 26;
    columnName = String.fromCharCode(65 + modulo) + columnName;
    colNum = Math.floor((colNum - modulo) / 26);
  }
  return columnName;
}

const App: React.FC = () => {
  const [enableDecimalLabeler, setEnableDecimalLabeler] = useState(false);

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
  const hub = useHub(hubProps);

  useEffect(() => {
    hubProps.labelers!.decimal = enableDecimalLabeler
      ? (n: number) => String(n)
      : null;
    hub.wire.transmit(hubProps);
  }, [enableDecimalLabeler]);

  let cells: CellsByAddressType = {};

  for (let rowNum = 1; rowNum < 500; rowNum++) {
    for (let colNum = 1; colNum < 140; colNum++) {
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
    E5: { colsize: 2, style: { backgroundColor: "#ffff99" } },
    E6: { colsize: 3, style: { backgroundColor: "#ffff99" } },
    I5: { rowsize: 2, style: { backgroundColor: "#ffff99" } },
    J5: { rowsize: 3, style: { backgroundColor: "#ffff99" } },
    C10: { rowsize: 2, style: { backgroundColor: "#99ccff" } },
    D18: { rowsize: 2, colsize: 2 ,style: { backgroundColor: "#99ccff" } },
    //F12: {colsize: 3, rowsize: 3, style:{ backgroundColor: "#ffccff", border:"solid red 2px"}},
    F12: {
      colsize: 3,
      rowsize: 3,
      style: {
        backgroundColor: "#ffccff",
        ...makeBorder({
          bottom: "solid red 2px",
          top: "solid red 2px",
          left: "solid red 2px",
          right: "solid red 2px",
        }),
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

    freeze: "C3",
    //freeze : 'C5',
    //freeze : 'D3',
    //freeze : 'B2',
  };

  cells["E4"] = {
    value: "OK",
    style: {
      backgroundImage: 'url(\"./top2bottom.svg\")',
      backgroundRepeat: "no-repeat" /* 繰り返さない */,
      backgroundSize: "cover",
      /* 要素全体を覆うように拡大縮小（はみ出しは隠す） */ backgroundPosition:
        "center" /* 中央に配置 */,
    },
  };
  cells["C4"] = {
    value: "OK",
    style: {
      backgroundImage: 'url(\"./bottom2top.svg\")',
      backgroundRepeat: "no-repeat",
      backgroundSize: "cover",
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
      backgroundImage: image2,
      backgroundRepeat: "no-repeat",
      backgroundSize: "cover",
    },
  };

  const { wire } = hub;

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

  const [table, setTable] = useState(
    new Table({
      minNumRows,
      maxNumRows,
      minNumCols,
      maxNumCols,
      sheetName,
      hub: wire,
    }),
  );

  cells["9"] = { height: 80 };

  ((cells["D9"] = {
    value: "価格",
    style: {
      textAlign: "right",
      verticalAlign: "top",
    },
  }),
    (cells["E9"] = {
      value: "コード",
      style: {
        textAlign: "center",
        verticalAlign: "center",
      },
    }),
    (cells["F9"] = {
      value: "商品",
      style: {
        textAlign: "left",
        verticalAlign: "bottom",
      },
    }),
    table.initialize(cells));
  table.setTotalSize();

  //console.log(cells["E5"]);
  //console.log(cells["C10"]);
  //console.log(cells["F12"]);

  //style={{ width: 800 }}
  return (
    <main>
      <div className="grid-container">
        <GridSheetPassive
          hub={hub}
          table={table}
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
            //mode: 'dark',
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
          table={table}
          //initialCells={ cells }
          options={
            {
              //mode: 'dark',
              //sheetHeight: 400,
              //sheetWidth: 800,
            }
          }
          sheetName="Sheet1"
          //style={{ width: 800, height: 300 }}
        />

        <br />

        <GridSheet
          hub={hub}
          initialCells={{
            default: {
              // cell size
              width: 100,
              height: 20,
              style: { fontSize: "14px" },
              default: { labeler: "decimal" },
            },
            0: {
              height: 20,
              width: 100,
              //freeze : 'C3',
            }, // header size
            A4: {
              value: "TEST",
              colsize: 2,
              rowsize: 2,
              style: {
                backgroundColor: "#ccff99",
              },
            },

            C3: { value: "=SUM(Sheet1!A2:B3)" },
            X20: { value: 789 },
            "A7:E7": {
              style: {
                ...makeBorder({
                  bottom: "4px double #000000",
                }),
              },
            },
            D8: {
              value: "abc",
              style: {
                backgroundColor: "#3498db",
                color: "white",
                fontWeight: "bold",
                textAlign: "center",
              },
            },

            //solid	一本線　初期値
            //double	二重線
            //dotted	点線
            //dashed	破線
            //wavy	波線

            A10: {
              style: { height: "40px" },
            },

            C10: {
              value: "製品",

              style: {
                textAlign: "left",
                verticalAlign: "bottom",
              },
            },

            D10: {
              value: "コード",

              style: {
                textAlign: "center",
                verticalAlign: "center",
              },
            },
            //https://gridsheet.walkframe.com/api-reference/props
            E10: {
              value: "価格",

              style: {
                textAlign: "right",
                verticalAlign: "top",
              },
            },

            "C10:E10": {
              style: {
                ...makeBorder({
                  bottom: "4px double #000000",
                }),
              },
            },
            "C9:E9": {
              style: {
                ...makeBorder({
                  bottom: "1px solid #000000",
                }),
              },
            },
            "C11:E11": {
              style: {
                ...makeBorder({
                  bottom: "1px solid #000000",
                }),
              },
            },
            "C12:E12": {
              style: {
                ...makeBorder({
                  bottom: "1px solid #000000",
                }),
              },
            },

            "B10:B12": {
              style: {
                ...makeBorder({
                  right: "1px solid #000000",
                }),
              },
            },
            "C10:C12": {
              style: {
                ...makeBorder({
                  right: "1px solid #000000",
                }),
              },
            },
            "D10:D12": {
              style: {
                ...makeBorder({
                  right: "1px solid #000000",
                }),
              },
            },
            "E10:E12": {
              style: {
                ...makeBorder({
                  right: "1px solid #000000",
                }),
              },
            },
            F: {
              labeler: "Done",
              width: 50,
              renderer: "checkbox",
              style: {
                backgroundColor: "#f8f9fa",
              },
              alignItems: "center",
              justifyContent: "center",
            },
            F1: { value: false },
            F2: { value: true },

            G: {
              labeler: "Count",
              width: 150,
              renderer: "thousand_separator",
              style: {
                backgroundColor: "#f8f9fa",
                textAlign: "right",
                //verticalAlign: "center",
              },
              //alignItems: 'center',
              //justifyContent: 'right',
            },
            G1: { value: 123456789 },
            G2: { value: 888888 },
          }}
          //style={{ width: 800, height: 300 }}
          options={{}}
          sheetName="Sheet2"
        />
      </div>
      {/* Labeler Control */}
      <div className="labeler-control">
        <label>
          <input
            type="checkbox"
            checked={enableDecimalLabeler}
            onChange={(e) => setEnableDecimalLabeler(e.target.checked)}
          />
          Enable Decimal Labeler for Sheet2
        </label>
      </div>
    </main>
  );
};

export default App;
