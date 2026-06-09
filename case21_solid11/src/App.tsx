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

  const [keyA, setKeyA] = createSignal(0);
  const [keyB, setKeyB] = createSignal(0);

  const syncScroll = (gsid, ele, top, left) => {
       console.log("syncScroll:", gsid, ele, top, left);
      if ( gsid == "TABLE-A" ) {
	      const el = document.querySelector("#TABLE-B" + "_Tabular");
	      el.scrollTo(left, top)
      } else if ( gsid == "TABLE-B" ) {
	      const el = document.querySelector("#TABLE-A" + "_Tabular");
	      el.scrollTo(left, top)
      }
  }

  const hubProps: HubProps = {
    renderers: {
      checkbox: new Renderer({ mixins: [CheckboxRendererMixin] }),
      thousand_separator: new Renderer({
        mixins: [ThousandSeparatorRendererMixin],
      }),
    },
    labelers: {},
    onInit: ({ table }) => {
      console.log(`hub Table initialized: ${table.sheetName}`);
    },
    onEdit: ({ table, gsid }) => {
      console.log(`hub Table edit: [${gsid}] ${table.sheetName}`);
      if ( gsid == "TABLE-A" ) {
          setKeyB(keyB() + 1);
      } else if ( gsid == "TABLE-B" ) {
          setKeyA(keyA() + 1);
      }
    },
    /*
    onKeyUp: ({ e, point }) => {
      console.log(`hub Table KeyUp: ${table.sheetName}`);
    },
    */
    onChange: ({ table, point }) => {
      console.log(`hub Table change: ${table.sheetName}`, point);
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

  //const [tableA, setTableA] = createSignal([table()]);
  //const [tableB, setTableB] = createSignal([table()]);

/*
  createEffect(() => {
    console.log("update Table: ", table());
  });
  createEffect(() => {
    console.log("update hub: ", hub());
  });
*/

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
	  gsid="TABLE-A"
	  syncScroll={syncScroll}
	  key={keyA}
          hub={hub}
          table={table()}
/*
          options={{
            sheetHeight: 400,
            sheetWidth: 400,
          }}
	*/  
          //sheetName="Sheet1"
          sheetName={sheetName}
          //style={{ width: 800, height: 300 }}
          //
        />
        <br />
{/*       
                <GridSheetPassive
	            gsid="TABLE-B"
	  syncScroll={syncScroll}
	  key={keyB}
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
*/}
      </div>

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
