import { Context } from "../store";
import {
  drag,
  setAutofillDraggingTo,
  setDragging,
  submitAutofill,
} from "../store/actions";
import { getAreaInTabular } from "../lib/virtualization";
import { insertRef, isFocus } from "../lib/input";
import { areaToRange, zoneToArea } from "../lib/structs";
import { isXSheetFocused } from "../store/helpers";
import { createEffect, useContext } from "solid-js";
import { createStore } from "solid-js/store";

type Props = {
  className?: string;
  style: CSSProperties;
  horizontal?: number;
  vertical?: number;
};

const acceleration = 0.4;
const maxSpeed = 200;

let lastScrollTime = new Date().getTime();
let currentSpeed = 0;
/*
export const ScrollHandle = ({
  style,
  horizontal = 0,
  vertical = 0,
  className = "",
}: Props) => {
*/
/*
export const ScrollHandle = memo<Props>(   //GUSA
    ({
        style,
        horizontal = 0,
        vertical = 0,
        className = "",
    }: Props) => {
*/
export function ScrollHandle({
  style,
  horizontal = 0,
  vertical = 0,
  className = "",
}: Props) {
  //const scrollRef = useRef<number | null>(null);
  let scrollRef = null;

  const { store, dispatch } = useContext(Context);

  const {
    tabularRef,
    autofillDraggingTo,
    dragging,
    selectingZone,
    editorRef,
    tableReactive: tableRef,
    searchInputRef,
    editingAddress,
  } = store();
  const table = tableRef;

  let isScrolling = false;
  const xSheetFocused = isXSheetFocused(store);
  const editingAnywhere = !!(table?.wire.editingAddress || editingAddress);

  const getDestEdge = (e: React.MouseEvent) => {
    if (!table) {
      return { x: -1, y: -1 };
    }
    if (horizontal == 0 && vertical == 0) {
      const tabularRect = tabularRef!.getBoundingClientRect();
      const { left, top, right, bottom } = tabularRect;
      horizontal = e.pageX > right ? 1 : e.pageX < left ? -1 : 0;
      if (horizontal === 0) {
        vertical = e.pageY > bottom ? 1 : e.pageY < top ? -1 : 0;
      }
    }
    const area = getAreaInTabular(tabularRef!);
    let { endX: x, endY: y } = selectingZone;
    if (horizontal) {
      x = horizontal > 0 ? area.right : area.left;
    } else if (vertical) {
      y = vertical > 0 ? area.bottom : area.top;
    }
    return { x, y };
  };

  const scrollStep = (e: React.MouseEvent) => {
    //console.log("scrollStep");
    if (!isScrolling || tabularRef === null || !table) {
      return;
    }
    const now = new Date().getTime();
    if (now - lastScrollTime > 1000) {
      currentSpeed = 0;
    }
    lastScrollTime = now;

    tabularRef.scrollBy({
      left: currentSpeed * horizontal!,
      top: currentSpeed * vertical!,
    });
    editorRef!.focus();

    const { x, y } = getDestEdge(e);
    if (autofillDraggingTo) {
      const { y: curY, x: curX } = autofillDraggingTo;
      dispatch(
        setAutofillDraggingTo({
          y: y === -1 ? curY : y,
          x: x === -1 ? curX : x,
        }),
      );
    } else {
      if (editingAnywhere) {
        const newArea = zoneToArea({ ...selectingZone, endY: y, endX: x });
        const sheetPrefix = table.sheetPrefix(!xSheetFocused);
        const sheetRange = areaToRange(newArea);
        const fullRange = `${sheetPrefix}${sheetRange}`;
        insertRef({ input: editorRef, ref: fullRange });
      }
      dispatch(drag({ y, x }));
    }
    currentSpeed = Math.min(currentSpeed + acceleration, maxSpeed);
    scrollRef = requestAnimationFrame(() => scrollStep(e));
  };

  const handleMouseEnter = (e: React.MouseEvent) => {
    console.log("MouseEnter");
    e.preventDefault();
    e.stopPropagation();
    if (isScrolling) {
      return;
    }

    isScrolling = true;

    if (horizontal === 0 || vertical === 0) {
      const tabularRect = tabularRef!.getBoundingClientRect();
      const { left, top, right, bottom } = tabularRect;

      horizontal ||= e.pageX > right ? 1 : e.pageX < left ? -1 : 0;
      if (horizontal === 0) {
        vertical ||= e.pageY > bottom ? 1 : e.pageY < top ? -1 : 0;
      }
    }
    scrollRef = requestAnimationFrame(() => scrollStep(e));
  };

  const stopScroll = () => {
    if (scrollRef !== null) {
      cancelAnimationFrame(scrollRef);
      scrollRef = null;
    }
    isScrolling = false;
    if (!isFocus(searchInputRef)) {
      // Pressing Enter on a search result will not focus the editor.
      editorRef?.focus?.();
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    console.log("MouseUp");
    e.preventDefault();
    e.stopPropagation();
    const area = getAreaInTabular(tabularRef!);
    if (area.bottom === -1 || area.right === -1) {
      return;
    }

    const { x, y } = getDestEdge(e);
    if (autofillDraggingTo) {
      const { y: curY, x: curX } = autofillDraggingTo;
      dispatch(
        submitAutofill({ y: y === -1 ? curY : y, x: x === -1 ? curX : x }),
      );
      editorRef!.focus();
    } else {
      if (editingAnywhere) {
        // inserting a range
        dispatch(drag({ y: -1, x: -1 })); // Reset dragging
      }
    }
  };

  const handleMouseUpWrapper = (e: React.MouseEvent) => {
    stopScroll();
    dispatch(setDragging(false));
    requestAnimationFrame(() => handleMouseUp(e));
  };

  const handleMouseLeave = () => {
    stopScroll();
  };

  createEffect(() => {
    return stopScroll;
  }, [stopScroll]);

  if (!editorRef || (!dragging && !autofillDraggingTo)) {
    return <div class={`gs-scroll-handle gs-hidden ${className}`} />;
  }

  return (
    <div
      style={style}
      class={`gs-scroll-handle ${className}`}
      onMouseUp={(e) => {
        handleMouseUpWrapper(e);
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    />
  );
}
//    });
