import { Context } from "../store";
import { p2a } from "../lib/converters";
import { setEditingAddress, setInputting, walk, write } from "../store/actions";
import * as prevention from "../lib/operation";
import { insertTextAtCursor } from "../lib/input";
import { editorStyle } from "./Editor";
import { ScrollHandle } from "./ScrollHandle";
import { createSignal } from "solid-js";

type FormulaBarProps = {
    ready: boolean;
};

//export const FormulaBar = ({ ready }: FormulaBarProps) => {
export const FormulaBar = memo<FormulaBarProps>(({ ready }: FormulaBarProps) => {
    const { store, dispatch } = useContext(Context);
    const [before, setBefore] = createSignal("");
    const {
        choosing,
        editorRef,
        largeEditorRef,
        tableReactive: tableRef,
        inputting,
        editingAddress: editingCell,
    } = store;
    const table = tableRef;
    //const hlRef = useRef<HTMLDivElement | null>(null);
    const hlRef = null;

    const address = choosing.x === -1 ? "" : p2a(choosing);
    const cell = table?.getCellByPoint(choosing, "SYSTEM");
    createEffect(() => {
        if (!table) {
            return;
        }
        let value = table.getCellByPoint(choosing, "SYSTEM")?.value ?? "";
        // debug to remove this line
        value = table.stringify({
            point: choosing,
            cell: { ...cell, value },
            refEvaluation: "RAW",
        });
        largeEditorRef.current!.value = value;
        setBefore(value as string);
    }, [address, table]);

    const writeCell = 
        (value: string) => {
            if (before !== value) {
                dispatch(write({ value }));
            }
            dispatch(setEditingAddress(""));
            editorRef.current!.focus();
        }

    createEffect(() => {
        const observer = new ResizeObserver((entries) => {
            entries.forEach(updateScroll);
        });
        if (largeEditorRef.current) {
            observer.observe(largeEditorRef.current);
        }
        return () => {
            observer.disconnect();
        };
    }, []);

    const largeInput = largeEditorRef.current;

    //const handleInput = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    const handleInput = (e: InputEvent<HTMLTextAreaElement>) => {
        dispatch(setInputting(e.currentTarget.value));
    }

    const updateScroll = () => {
        if (!hlRef.current || !largeEditorRef.current) {
            return;
        }
        hlRef.current.style.height = `${largeEditorRef.current.clientHeight}px`;
        hlRef.current.scrollLeft = largeEditorRef.current.scrollLeft;
        hlRef.current.scrollTop = largeEditorRef.current.scrollTop;
    }

    const handleFocus = 
        (e: React.FocusEvent<HTMLTextAreaElement>) => {
            if (!largeInput || !table) {
                return;
            }
            dispatch(setEditingAddress(address));
            table.wire.lastFocused = e.currentTarget;
        }

    const handleBlur = 
        (e: React.FocusEvent<HTMLTextAreaElement>) => {
            if (e.currentTarget.value!.startsWith("=")) {
                return true;
            } else {
                if (editingCell) {
                    writeCell(e.currentTarget.value);
                }
            }
        }

    const handleKeyDown = 
        (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.ctrlKey || !table) {
                return true;
            }
            const input = e.currentTarget;

            switch (e.key) {
                case "Enter": {
                    if (e.altKey) {
                        insertTextAtCursor(input, "\n");
                    } else {
                        writeCell(input.value);
                        dispatch(setInputting(""));
                        dispatch(
                            walk({
                                numRows: table.getNumRows(),
                                numCols: table.getNumCols(),
                                deltaY: 1,
                                deltaX: 0,
                            }),
                        );
                        e.preventDefault();
                        return false;
                    }
                    break;
                }
                case "Escape": {
                    input.value = before;
                    dispatch(setInputting(before));
                    dispatch(setEditingAddress(""));
                    e.preventDefault();
                    editorRef.current!.focus();

                    break;
                }
                case "a": // A
                    if (e.ctrlKey || e.metaKey) {
                        return true;
                    }
                    break;
                case "c": // C
                    if (e.ctrlKey || e.metaKey) {
                        return true;
                    }
                    break;
                case "v": // V
                    if (e.ctrlKey || e.metaKey) {
                        return true;
                    }
                    break;
            }

            const cell = table.getCellByPoint(choosing, "SYSTEM");
            if (prevention.hasOperation(cell?.prevention, prevention.Write)) {
                console.warn("This cell is protected from writing.");
                e.preventDefault();
            }
            updateScroll();
            return false;
        }

    const style: React.CSSProperties = ready ? {} : { visibility: "hidden" };
    if (!table) {
        return (
            <label class="gs-formula-bar gs-hidden" style={style}>
                <div class="gs-selecting-address"></div>
                <div class="gs-fx">Fx</div>
                <div class="gs-formula-bar-editor-inner">
                    <textarea />
                </div>
            </label>
        );
    }
    return (
        <label
            class="gs-formula-bar"
            data-sheet-id={store.sheetId}
            style={style}
        >
            <ScrollHandle
                style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    zIndex: 2
                }}
                vertical={-1}
            />
            <div class="gs-selecting-address">{address}</div>
            <div class="gs-fx">Fx</div>
            <div class="gs-formula-bar-editor-inner">
                <div
                    class="gs-editor-hl"
                    ref={hlRef}
                    style={{
                        get height() { return largeEditorRef.current?.clientHeight },
                        width: "100%"
                    }}
                >
                    {cell?.disableFormula ? inputting : editorStyle(inputting)}
                </div>
                <textarea
                    name="gs-formula-bar-editor"
                    data-sheet-id={store.sheetId}
                    data-size="large"
                    rows={1}
                    spellCheck={false}
                    ref={largeEditorRef}
                    //value={inputting}
                    defaultValue={inputting} //GUSA
                    onInput={handleInput} //GUSA
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    onKeyUp={updateScroll}
                    onScroll={updateScroll}
                ></textarea>
            </div>
        </label>
    );
    //};
});
