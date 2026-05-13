import { x2c, y2r } from "../lib/converters";
import { zoneToArea, among, areaToRange } from "../lib/structs";
import { choose, select, drag, write, setEditorRect, setContextMenuPosition, setAutofillDraggingTo, setEditingAddress, setDragging, submitAutofill, setStore } from "../store/actions";
import { Context } from "../store";
import { FormulaError } from "../formula/evaluator";
import { insertRef, isRefInsertable } from "../lib/input";
import { isXSheetFocused } from "../store/helpers";
import { isTouching, safePreventDefault } from "../lib/events";
import { UserTable } from "../lib/table";
import { useContext, createEffect, on, createMemo, mergeProps } from "solid-js";

type Props = {
    x: number;
    y: number;
    colSpan_size: number;
    rowSpan_size: number;
    freezeStyle: CSSProperties;
    operationStyle?: CSSProperties;
    freeze_y: boolean;
    freeze_x: boolean;
};

export const Cell: FC<Props> = (
    ({ y, x, freezeStyle, colSpan_size, rowSpan_size, operationStyle, freeze_y, freeze_x }) => {

        const rowId = y2r(y);
        const colId = x2c(x);
        const address = `${colId}${rowId}`;
	//console.log(address)
        const { store, dispatch } = useContext(Context);
        //const isFirstPointed = useRef(true);
        let isFirstPointed = true;

        //const cellRef = useRef<HTMLTableCellElement>(null);
        let cellRef = null;
        let {
            tableReactive: tableRef,
            editingAddress,
            choosing,
            selectingZone,
            leftHeaderSelecting,
            topHeaderSelecting,
            editorRef,
            showAddress,
            autofillDraggingTo,
            contextMenuItems,
        } = store();
        const table = tableRef;
        //console.log(table)
        //console.log(editorRef)

        // Whether the focus is on another sheet
        const xSheetFocused = isXSheetFocused(store);

        const lastFocused = table?.wire.lastFocused;

        const selectingArea = zoneToArea(selectingZone); // (top, left) -> (bottom, right)

        const editing = editingAddress === address;
        const pointed = choosing.y === y && choosing.x === x;
        const _setEditorRect = (() => {
            const rect = cellRef?.getBoundingClientRect();
            if (rect == null) {
                return null;
            }
            dispatch(
                setEditorRect({
                    y: rect.y,
                    x: rect.x,
                    height: rect.height,
                    width: rect.width,
                }),
            );
        });

        createEffect(on(
            () => [pointed, editing],
            () => {
                // Avoid setting coordinates on the initial render to account for shifts caused by redrawing due to virtualization.
                if (pointed && !isFirstPointed) {
                    _setEditorRect();
                    return;
                }
                isFirstPointed = false;
            }
        ));

        if (!table) {
            return null;
        }

        const cell = table.getCellByPoint({ y, x }, "SYSTEM");
        const writeCell = ((value: string) => {
            dispatch(write({ value }));
        });

        const sync = ((table: UserTable) => {
            dispatch(setStore({ tableReactive: { current: table.__raw__ } }));
        });
        1
        let errorMessage = "";
        let rendered: any;
        try {
            rendered = table.render({ table, point: { y, x }, sync });
	    //console.log(rendered);
            if (rendered == "") { // GUSA
                rendered = " "
            }

        } catch (e: any) {
            if (e instanceof FormulaError) {
                errorMessage = e.message;
                rendered = e.code;
            } else {
                errorMessage = e.message;
                rendered = "#UNKNOWN";
                console.error(e);
            }
            // TODO: debug flag
        }
        const input = editorRef;

        const editingAnywhere = !!(table.wire.editingAddress || editingAddress);

        const handleDragStart = (
            (e: React.MouseEvent | React.TouchEvent) => {
                e.stopPropagation();
                safePreventDefault(e);

                if (!isTouching(e)) {
                    return false;
                }
                if (!input) {
                    return false;
                }

                // Single cell selection only for touch events
                if (e.type.startsWith("touch")) {
                    // Blur the input field to commit current value when selecting via touch
                    if (editingAnywhere && input) {
                        input.blur();
                    }
                    dispatch(choose({ y, x }));
                    dispatch(select({ startY: y, startX: x, endY: y, endX: x }));
                    return true;
                }

                // Normal drag operation for mouse events
                if (e.shiftKey) {
                    dispatch(drag({ y, x }));
                } else {
                    dispatch(select({ startY: y, startX: x, endY: -1, endX: -1 }));
                }

                dispatch(setDragging(true));
                const fullAddress = `${table.sheetPrefix(!xSheetFocused)}${address}`;
                if (editingAnywhere) {
                    const inserted = insertRef({
                        input: lastFocused || null,
                        ref: fullAddress,
                    });
                    if (inserted) {
                        return false;
                    }
                }

                table.wire.lastFocused = input;
                input.focus();
                dispatch(setEditingAddress(""));

                if (autofillDraggingTo) {
                    return false;
                }

                if (editingAnywhere) {
                    writeCell(input.value);
                }
                if (!e.shiftKey) {
                    dispatch(choose({ y, x }));
                }
                return true;
            }
        );

        const handleDragEnd = (
            (e: React.MouseEvent | React.TouchEvent) => {
                e.stopPropagation();
                if (e.type.startsWith("touch")) {
                    return;
                }

                safePreventDefault(e);
                dispatch(setDragging(false));
                if (autofillDraggingTo) {
                    dispatch(submitAutofill(autofillDraggingTo));
                    input?.focus();
                    return false;
                }
                if (editingAnywhere) {
                    dispatch(drag({ y: -1, x: -1 }));
                }
            }
        );

        const handleDragging = (
            (e: React.MouseEvent | React.TouchEvent) => {
                if (!isTouching(e)) {
                    return false;
                }

                // Do nothing for touch events
                if (e.type.startsWith("touch")) {
                    return false;
                }

                safePreventDefault(e);
                e.stopPropagation();

                if (autofillDraggingTo) {
                    dispatch(setAutofillDraggingTo({ x, y }));
                    return false;
                }
                if (leftHeaderSelecting) {
                    dispatch(drag({ y, x: table.getNumCols() }));
                    return false;
                }
                if (topHeaderSelecting) {
                    dispatch(drag({ y: table.getNumRows(), x }));
                    return false;
                }
                if (editingAnywhere && !isRefInsertable(lastFocused || null)) {
                    return false;
                }
                dispatch(drag({ y, x }));

                if (editingAnywhere) {
                    const newArea = zoneToArea({ ...selectingZone, endY: y, endX: x });
                    const fullRange = `${table.sheetPrefix(!xSheetFocused)}${areaToRange(newArea)}`;
                    insertRef({ input: lastFocused || null, ref: fullRange });
                }
                //table.wire.transmit(); // Force drawing because the formula is not reflected in largeInput
                return true;
            }
        );

        const handleAutofillMouseDown = ((e: React.MouseEvent) => {
            dispatch(setAutofillDraggingTo({ x, y }));
            dispatch(setDragging(true));
            e.stopPropagation();
        });

        // --- Memoize event handlers with useCallback ---
        const onContextMenu = (
            (e: React.MouseEvent<HTMLTableCellElement>) => {
                if (contextMenuItems.length > 0) {
                    e.stopPropagation();
                    safePreventDefault(e);
                    dispatch(setContextMenuPosition({ y: e.clientY, x: e.clientX }));
                    return false;
                }
                return true;
            }
        );

        const onDoubleClick = (
            (e: React.MouseEvent<HTMLTableCellElement>) => {
                e.stopPropagation();
                safePreventDefault(e);
                setEditingAddress(address);
                const dblclick = document.createEvent("MouseEvents");
                dblclick.initEvent("dblclick", true, true);
                input?.dispatchEvent(dblclick);
                return false;
            }
        );

        const autofillDragClass = createMemo(() => {
            if (!editing && pointed && selectingArea.bottom === -1) {
                return "gs-autofill-drag";
            }

            if (selectingArea.bottom === y && selectingArea.right === x) {
                return "gs-autofill-drag";
            }
            return "gs-autofill-drag gs-hidden";
        });

        /*
      const span_list = [
       {  x:  5, y:  5, col_size: 2, row_size: 1 },
    //   {  x:  3, y: 10, col_size: 2, row_size: 2 },
      ]
    */
        /*
      let colSpan_size = 1; // default
      let rowSpan_size = 1; // default
    
      if (typeof span_list !== 'undefined') {
        for ( let i = 0; i < span_list.length; i++){
          if ( x == span_list[i].x && y == span_list[i].y ) {
              if (span_list[i].col_size > 1 ) {
                 colSpan_size = span_list[i].col_size;
              }
              if (span_list[i].row_size > 1 ) {
                 rowSpan_size = span_list[i].row_size;
              }
          }
        }
      }
    */

/*                                      TODO
        if (!input) {
            return (
                <td
                    data-x={x}
                    data-y={y}
                    data-address={address}
                    class="gs-cell gs-hidden"
                >
                    <div class="gs-cell-inner-wrap">
                        <div class="gs-cell-inner">
                            <div class="gs-cell-rendered"></div>
                        </div>
                        <div class="gs-autofill-drag"></div>
                    </div>
                </td>
            );
        }
*/
        return (
            <td
                ref={cellRef}
                data-x={x}
                data-y={y}
                data-address={address}
                class={`gs-cell ${among(selectingArea, {
                    y: y,
                    x: x
                }) ? "gs-selecting" : ""} ${pointed ? "gs-choosing" : ""} ${editing ? "gs-editing" : ""
                    } ${freeze_y ? "freeze_y" : ""}  ${freeze_x ? "freeze_x" : ""} `}
                style={mergeProps(() => cell?.style, operationStyle, freezeStyle)}
                onContextMenu={onContextMenu}
                onDoubleClick={onDoubleClick}
                colSpan={colSpan_size}
                rowSpan={rowSpan_size}
            >
                <div
                    class={`gs-cell-inner-wrap`}
                    onMouseDown={handleDragStart}
                    onTouchStart={handleDragStart}
                    onMouseEnter={handleDragging}
                    onMouseUp={handleDragEnd}

                >
                    <div
                        class={"gs-cell-inner"}
                        style={{}}
                    >
                        {errorMessage && (
                            <div class="gs-formula-error-triangle" title={errorMessage} />
                        )}
                        {showAddress && <div class="gs-cell-label">{address}</div>}
                        <div class="gs-cell-rendered">{rendered}</div>
                    </div>
                    <div
                        class={autofillDragClass()}
                        onMouseDown={handleAutofillMouseDown}
                    ></div>
                </div>
            </td>
        );
//    },
    } //FIX
);


