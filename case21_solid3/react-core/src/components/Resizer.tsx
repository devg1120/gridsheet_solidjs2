import { Context } from "../store";
import {
  setResizingPositionY,
  setResizingPositionX,
  setStore,
} from "../store/actions";
import {
  DEFAULT_HEIGHT,
  DEFAULT_WIDTH,
  MIN_WIDTH,
  MIN_HEIGHT,
} from "../constants";
import { zoneToArea, makeSequence, between } from "../lib/structs";
import { CellsByAddressType } from "../types";
import { p2a } from "../lib/converters";
import { useContext, createSignal, createEffect, For } from "solid-js";

export const Resizer = () => {
  const { store, dispatch } = useContext(Context);
  let {
    resizingPositionY: posY,
    resizingPositionX: posX,
    tableReactive: tableRef,
    leftHeaderSelecting,
    topHeaderSelecting,
    selectingZone,
    editorRef,
    mainRef,
  } = store();

  //console.log("start------------------")
  const table = tableRef;

  const [key, setKey] = createSignal([{}]);

  createEffect(() => {
    //console.log("posX", store().resizingPositionX);
    posX = store().resizingPositionX;

    [y, startY, endY] = posY;
    [x, startX, endX] = posX;


     cell = table.getCellByPoint(
      { y: y === -1 ? 0 : y, x: x === -1 ? 0 : x },
      "SYSTEM",
    );

    //{ y: offsetY, x: offsetX } = mainRef.getBoundingClientRect();

    offsetY = mainRef.getBoundingClientRect().y;
    offsetX = mainRef.getBoundingClientRect().x;

    baseWidth = cell?.width || DEFAULT_WIDTH;
    baseHeight = cell?.height || DEFAULT_HEIGHT;

    width = baseWidth + (endX - startX);
    height = baseHeight + (endY - startY);


    setKey([{}]);
  });

  createEffect(() => {
    //console.log("posY", store().resizingPositionY);
    posY = store().resizingPositionY;

    [y, startY, endY] = posY;
    [x, startX, endX] = posX;


     cell = table.getCellByPoint(
      { y: y === -1 ? 0 : y, x: x === -1 ? 0 : x },
      "SYSTEM",
    );
    //console.log("Cell",cell);
    //{ y: offsetY, x: offsetX } = mainRef.getBoundingClientRect();

    offsetY = mainRef.getBoundingClientRect().y;
    offsetX = mainRef.getBoundingClientRect().x;

    baseWidth = cell?.width || DEFAULT_WIDTH;
    baseHeight = cell?.height || DEFAULT_HEIGHT;

    width = baseWidth + (endX - startX);
    height = baseHeight + (endY - startY);
    //console.log(width, height);


    setKey([{}]);
  });

  let [y, startY, endY] = posY;
  let [x, startX, endX] = posX;

  if (mainRef == null || editorRef == null || !table) {
     console.log("return", mainRef, editorRef);
    return <div class="gs-resizing gs-hidden" />;
  }

  let cell = table.getCellByPoint(
    { y: y === -1 ? 0 : y, x: x === -1 ? 0 : x },
    "SYSTEM",
  );
  let { y: offsetY, x: offsetX } = mainRef.getBoundingClientRect();

  let baseWidth = cell?.width || DEFAULT_WIDTH;
  let baseHeight = cell?.height || DEFAULT_HEIGHT;

  let width = baseWidth + (endX - startX);
  let height = baseHeight + (endY - startY);

  /***********************************************************************/

  const handleResizeEnd = () => {
    console.log("handleResizeEnd")
    const selectingArea = zoneToArea(selectingZone);
    const { top, left, bottom, right } = selectingArea;
    const diff: CellsByAddressType = {};
    if (x !== -1) {
      let xs = [x];
      if (topHeaderSelecting && between({ start: left, end: right }, x)) {
        xs = makeSequence(left, right + 1);
      }
      xs.forEach((x) => {
        diff[p2a({ y: 0, x })] = { width };
      });
    }
    if (y !== -1) {
      let ys = [y];
      if (leftHeaderSelecting && between({ start: top, end: bottom }, y)) {
        ys = makeSequence(top, bottom + 1);
      }
      ys.forEach((y) => {
        diff[p2a({ y, x: 0 })] = { height };
      });
    }
    console.log("diff", diff);
    table.update({
      diff,
      partial: true,
      operator: "USER",
      undoReflection: { selectingZone, sheetId: table.sheetId },
    });
    dispatch(
      setStore({
        //tableReactive: { current: table },
        tableReactive:  table ,   //TODO
      }),
    );
    dispatch(setResizingPositionY([-1, -1, -1]));
    dispatch(setResizingPositionX([-1, -1, -1]));
    //editorRef.current!.focus();
    editorRef!.focus();
  };

  const handleResizeMove = (e: MouseEvent) => {
    //console.log("handleResizeMove")
    if (y !== -1) {
      let endY = e.clientY;
      const height = baseHeight + (endY - startY);
      if (height < MIN_HEIGHT) {
        endY += MIN_HEIGHT - height;
      }
      dispatch(setResizingPositionY([y, startY, endY]));
    } else if (x !== -1) {
      let endX = e.clientX;
      const width = baseWidth + (endX - startX);
      if (width < MIN_WIDTH) {
        endX += MIN_WIDTH - width;
      }
      dispatch(setResizingPositionX([x, startX, endX]));
    }
  };

  return (
  <For each={key()}>{() =>
    <div
      class={`gs-resizing ${y === -1 && x === -1 ? "gs-hidden" : ""}`}
      onMouseUp={handleResizeEnd}
      onMouseMove={handleResizeMove}
      //onClick={() => console.log('Resizer Clicked!')}
    >
      <div class={`gs-line-vertical ${x === -1 ? "gs-hidden" : ""}`}>
        <div
          class={"gs-line"}
          style={{ width: "1px" , height: "100%", left: (endX - offsetX) + "px" }}
        >
          <span style={{ left: "-50%" }}>{width}px</span>
        </div>
      </div>
      <div class={`gs-line-horizontal ${y === -1 ? "gs-hidden" : ""}`}>
        <div
          class={"gs-line"}
          style={{  width: "100%", height: "1px", top: (endY - offsetY) + "px" }}
        >
          <span style={{  top: "-50%" }}>{height}px</span>
        </div>
      </div>
    </div>
}</For>
  );
};
