import { x2c } from "../lib/converters";
import { between, zoneToArea } from "../lib/structs";
import { Context } from "../store";
import {
  choose,
  drag,
  select,
  selectCols,
  setAutofillDraggingTo,
  setContextMenuPosition,
  setDragging,
  setEditingAddress,
  setResizingPositionX,
  write,
} from "../store/actions";
import { DEFAULT_WIDTH } from "../constants";
import * as prevention from "../lib/operation";
import { insertRef } from "../lib/input";
import { isXSheetFocused } from "../store/helpers";
import { ScrollHandle } from "./ScrollHandle";
import { isTouching, safePreventDefault } from "../lib/events";
import { useDebounceCallback } from "./hooks";
import { mergeProps, useContext } from "solid-js";

type Props = {
  x: number;
  isFreeze: boolean; //GUSA
  freezeStyle: CSSProperties; //GUSA
};

//export const HeaderCellTop: FC<Props> = memo(({ x, isFreeze, freezeStyle }) => {
export const HeaderCellTop = ({ x, isFreeze, freezeStyle }) => {
  const colId = x2c(x);
  const { store, dispatch } = useContext(Context);

  const {
    tableReactive: tableRef,
    editingAddress,
    choosing,
    selectingZone,
    topHeaderSelecting,
    editorRef,
    autofillDraggingTo,
    dragging,
    contextMenuItems,
  } = store();
  const table = tableRef;

  const col = table?.getCellByPoint({ y: 0, x }, "SYSTEM");
  const width = col?.width || DEFAULT_WIDTH;

  const xSheetFocused = isXSheetFocused(store);
  const lastFocused = table?.wire.lastFocused;

  const editingAnywhere = !!(table?.wire.editingAddress || editingAddress);

  const writeCell = (value: string) => {
    dispatch(write({ value, point: choosing }));
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    dispatch(setResizingPositionX([x, e.clientX, e.clientX]));
    e.stopPropagation();
    safePreventDefault(e);
  };

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    safePreventDefault(e);

    if (!isTouching(e) || !table) {
      return false;
    }

    if (dragging) {
      return false;
    }

    // Single column selection only for touch events
    if (e.type.startsWith("touch")) {
      // Blur the input field to commit current value when selecting via touch
      if (editingAnywhere && editorRef.current) {
        editorRef.current.blur();
      }
      dispatch(choose({ y: 1, x }));
      dispatch(
        select({ startY: 1, startX: x, endY: table.getNumRows(), endX: x }),
      );
      return true;
    }

    dispatch(select({ startY: 1, startX: x, endY: -1, endX: x }));
    const fullAddress = `${table.sheetPrefix(!xSheetFocused)}${colId}:${colId}`;
    if (editingAnywhere) {
      const inserted = insertRef({
        input: lastFocused || null,
        ref: fullAddress,
      });
      if (inserted) {
        dispatch(
          select({ startY: table.getNumRows(), startX: x, endY: 0, endX: x }),
        );
        return false;
      }
    }

    let startX = e.shiftKey ? selectingZone.startX : x;
    if (startX === -1) {
      startX = choosing.x;
    }

    dispatch(
      selectCols({
        range: { start: startX, end: x },
        numRows: table.getNumRows(),
      }),
    );

    if (editingAnywhere) {
      writeCell(lastFocused?.value ?? "");
    }
    dispatch(choose({ y: 1, x: startX }));
    dispatch(setEditingAddress(""));
    dispatch(setDragging(true));

    if (autofillDraggingTo) {
      return false;
    }
    return true;
  };

  const handleDragEnd = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (e.type.startsWith("touch")) {
      return;
    }

    safePreventDefault(e);
    dispatch(setDragging(false));
    if (autofillDraggingTo) {
      editorRef.current!.focus();
      return false;
    }
  };

  const handleDragging = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isTouching(e) || !table) {
      return false;
    }

    if (e.type.startsWith("touch")) {
      return false;
    }

    safePreventDefault(e);
    e.stopPropagation();

    if (autofillDraggingTo) {
      dispatch(setAutofillDraggingTo({ y: 1, x }));
      return false;
    }

    if (editingAnywhere) {
      const newArea = zoneToArea({ ...selectingZone, endY: 1, endX: x });
      const [left, right] = [x2c(newArea.left), x2c(newArea.right)];
      const fullRange = `${table.sheetPrefix(!xSheetFocused)}${left}:${right}`;
      insertRef({ input: lastFocused || null, ref: fullRange });
    }

    if (autofillDraggingTo == null) {
      const { startY } = selectingZone;
      if (startY === 1) {
        dispatch(drag({ y: table.getNumRows(), x }));
      } else {
        dispatch(drag({ y: 1, x }));
      }
    }
    return false;
  };

  if (!table) {
    return (
      <th data-x={x} class="gs-th gs-th-top gs-hidden">
        <div class="gs-th-inner-wrap">
          <div class="gs-th-inner">
            <ScrollHandle style={{ position: "absolute" }} vertical={-1} />
            <div class="gs-resizer"></div>
          </div>
        </div>
      </th>
    );
  }
  const id = `CH-${colId}`;
  //style={{ width, minWidth: width, maxWidth: width, "z-index":150,  }}
  //style={{ width, minWidth: width, maxWidth: width, "z-index":150, ...freezeStyle, }}
  return (
    <th
      id={id}
      data-x={x}
      class={`gs-th gs-th-top header_freeze_y ${choosing.x === x ? "gs-choosing" : ""} ${
        between(
          {
            start: selectingZone.startX,
            end: selectingZone.endX,
          },
          x,
        )
          ? topHeaderSelecting
            ? "gs-th-selecting"
            : "gs-selecting"
          : ""
      } `}
      //style={{ width, minWidth: width, maxWidth: width, "z-index":150,  }}

      style={mergeProps(
        {
          "width": width + "px",
          "min-width": width + "px",
          "max-width": width + "px",
        },
        freezeStyle,
      )}
      //style={{ width:width +"px", min-width: width+ "px", max-width: width + "px",  ...freezeStyle }}

      onContextMenu={(e) => {
        if (contextMenuItems.length > 0) {
          e.stopPropagation();
          safePreventDefault(e);
          dispatch(setContextMenuPosition({ y: e.clientY, x: e.clientX }));

          return false;
        }
        return true;
      }}
    >
      <div
        class="gs-th-inner-wrap"
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        onMouseEnter={handleDragging}
        onMouseUp={handleDragEnd}
      >
        <div
          class="gs-th-inner "
          style={{ height: table.headerHeight + "px", position: "relative" }}
        >
          <ScrollHandle
            style={{
              position: "absolute",
              "z-index": topHeaderSelecting ? -1 : 1,
            }}
            vertical={-1}
          />
          {table.getLabel(col?.labeler, x) ?? colId}
          {!isFreeze ? (
            <div
              class={`
                  gs-resizer 
                  ${prevention.hasOperation(col?.prevention, prevention.Resize) ? "gs-protected" : ""}
                  ${dragging ? "gs-hidden" : ""} `}
              style={{ height: table.headerHeight }}
              onMouseDown={handleResizeMouseDown}
            >
              <i />
            </div>
          ) : (
            <></>
          )}
        </div>
      </div>
    </th>
  );
  //});
};
