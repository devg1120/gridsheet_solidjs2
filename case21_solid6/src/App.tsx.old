import React, { useState, useEffect } from "react";
//import { GridSheet, useHub, type HubProps } from '@gridsheet/react-core';

import {
  GridSheet,
  useHub,
  makeBorder,
  type HubProps,
} from "../react-core/src/index";

import type { CellsByAddressType } from "../react-core/src/types";

function colNumToId(colNum:number) : string {
    let columnName = '';
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

  let cells: CellsByAddressType  = {};

  for ( let rowNum = 1 ; rowNum < 500 ; rowNum++ ) {
    for ( let colNum = 1 ; colNum < 140 ; colNum++ ) {
        const columnName = colNumToId(colNum);
        const cellName = columnName  +  String(rowNum);
	//console.log(cellName);
	cells[cellName] = { value: cellName }

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
  let spans:CellsByAddressType = {

     E5:  {colsize: 2            , style:{ backgroundColor: "#ffff99"}},
     C10: {            rowsize: 2, style:{ backgroundColor: "#99ccff"}},
     //F12: {colsize: 3, rowsize: 3, style:{ backgroundColor: "#ffccff", border:"solid red 2px"}},
     F12: {colsize: 3, rowsize: 3, style:{ backgroundColor: "#ffccff", 
            ...makeBorder({bottom:"solid red 2px",
	                   top:   "solid red 2px",
	                   left:  "solid red 2px",
	                   right: "solid red 2px",
			   },
	    )}},
  }

  for (const key in spans) {
      //console.log(key, spans[key]);
      Object.assign(cells[key], spans[key])
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


  cells['default'] = {                   // cell size
              width: 90,
              height: 24,
              style: { fontSize: "14px" },
              default: { labeler: "decimal" },
  };

  cells['0'] = {
          height: 24,  // CR   table.headerHeight
          width: 50,   // CR  table.headerWidth
	        //default HEADER_HEIGHT = 24;
                //default HEADER_WIDTH = 50;

	  freeze : 'C3',
	  //freeze : 'C5',
	  //freeze : 'D3',
	  //freeze : 'B2',
  }
 
  //console.log(cells["E5"]);
  //console.log(cells["C10"]);
  //console.log(cells["F12"]);

  //style={{ width: 800 }}
  return (
    <main>
      <div className="grid-container">
        <GridSheet
          hub={hub}
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

         initialCells={ cells }

          options={
            {
              //mode: 'dark',
            }
          }
          sheetName="Sheet1"
          //style={{ width: 800, height: 300 }}
        />

        <br />
	

        <GridSheet
          hub={hub}
          initialCells={{
            default: {                   // cell size
              width: 100,
              height: 20,
              style: { fontSize: "14px" },
              default: { labeler: "decimal" },
            },
	    0: { height:20, width: 100},  // header size
            A4: { value: "TEST", colsize:2, rowsize:2,
              style: {
                backgroundColor: "#ccff99",
		}

	    },
            C3: { value: "=SUM(Sheet1!A2:B3)" },
            X20: { value: 789 },
	             F: {
                width: 50,
                renderer: 'checkbox',
                style: {
                  backgroundColor: '#f8f9fa',
                },
                alignItems: 'center',
                justifyContent: 'center',
              },
            "A7:F7": {
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
            //default: { labeler: 'decimal' },
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
