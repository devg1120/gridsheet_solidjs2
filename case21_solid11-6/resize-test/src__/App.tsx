import type { Component } from "solid-js";
import { createSignal, createMemo } from "solid-js";
import styles from "./App.module.css";
import { DragAndResize, defaultState } from "./resize";
import type { Position, State  } from "./resize";

const App: Component = () => {
    const [enabled, setEnabled] = createSignal<boolean>(true);
    const [separateEnabling, setSeparateEnabling] = createSignal<boolean>(false);
    const [dragEnabled, setDragEnabled] = createSignal<boolean>(true);
    const [resizeEnabled, setResizeEnabled] = createSignal<boolean>(true);
    const [position, setPosition] = createSignal<Position>();
    const [state, setState] = createSignal<State>(defaultState);
    const [handleEnabled, setHandleEnabled] = createSignal<boolean>(false);
    let reference: HTMLElement | undefined = undefined;
    const [boundaries, setBoundaries] = createSignal<boolean>(true);
    const [userSelect, setUserSelect] = createSignal<boolean>(true);
    const [className, setClassName] = createSignal<"" | "draggable">("draggable");
    createMemo(() => {
        if (handleEnabled()) {
            setClassName("");
        } else {
            setClassName("draggable");
        }
    });
    const [rightHandlesOnly, setRightHandlesOnly] = createSignal<boolean>(true);

    return (
      <div style={{ width:"1000px", height:"500px", "background-color": "lightgray",}} >
            <DragAndResize
                class={styles.DragAndResize + " " + className()}
                style={{
                    "border-radius": "0.5rem",
                }}
                ref={reference}
                enabled={
                    separateEnabling()
                        ? {
                            drag: dragEnabled(),
                            resize: resizeEnabled(),
                        }
                        : enabled()
                }
                disableUserSelect={userSelect()}
                initialState={{ x: 10, y: 10, width: 150, height: 150 }}
                minSize={{ width: 80, height: 80 }}
		//maxSize={{ width: 500, height: 500 }}
                position={position()}
                state={state()}
                boundary={
                    boundaries()
                        ? "window"
                        : "parent" /*{top: 20, left: 20, right: 20, bottom: 20}*/
                }
                dragHandle={handleEnabled() ? ".handle" : undefined}
                classWhileDragging="currentlyDragging"
                classWhileResizing="currentlyResizing"
                dragStart={(e) => {
                    console.log("Drag started parameters:");
                    console.log({ event: e });
                }}
                drag={(e, offset, state) => {
                    console.log("Drag parameters:");
                    console.log({ event: e, offset: offset, state: state });
                }}
                dragEnd={(e, offset, state) => {
                    console.log("Drag ended parameters");
                    console.log({ event: e, offset: offset, state: state });
                }}
                resizeStart={(e) => {
                    console.log("Resize started parameters:");
                    console.log({ event: e });
                }}
                resize={(e, dir, action) => {
                    console.log("Resize parameters:");
                    console.log({ event: e, direction: dir, action: action });
                }}
                resizeEnd={(e, dir, action) => {
                    console.log("Resize ended parameters:");
                    console.log({ event: e, direction: dir, action: action });
                }}
                id="DragAndResize"
                resizeAxes={
                    rightHandlesOnly()
                        ? undefined
                        : {
                              topRight: true,
                              right: true,
                              bottomRight: true,
                          }
                }
                resizeHandleProps={{
                    all: {
                        className: "thing",
                    },
                }}
                customResizeHandles={[
                    {
                        direction: "right",
                        element: document.getElementById("custom-handle-right")!,
                    },
                ]}
            >
                <div class={styles.DragHandle} classList={{ handle: true }} />
                <div id="custom-handle-right" />
            </DragAndResize>
       </div>
    );
};

export default App;
