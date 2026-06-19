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
    const [handleEnabled, setHandleEnabled] = createSignal<boolean>(true);
    let reference: HTMLElement | undefined = undefined;
    const [boundaries, setBoundaries] = createSignal<boolean>(false);
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
    /*
        <div class={styles.App}>
        <div >
        <div >
*/
    return (
        <>
        <div class={styles.Menu}>
            <button class={styles.Button} style={{  "background-color": enabled() ? "white" : "orange", }} 
	        onClick={() => setEnabled(!enabled())}>
                 {enabled() ? "disable" : "enable"} overall
            </button>
            <button class={styles.Button} style={{  "background-color": separateEnabling() ? "white" : "orange", }}
	        onClick={() => setSeparateEnabling(!separateEnabling())}>
                 {separateEnabling() ? "unseparate" : "separate"} enable/disable 
            </button>
            <button class={styles.Button} style={{  "background-color": dragEnabled() ? "white" : "orange", }}
	        onClick={() => setDragEnabled(!dragEnabled())}>
                 {dragEnabled() ? "disable" : "enable"} drag
            </button>
            <button class={styles.Button} style={{  "background-color": resizeEnabled() ? "white" : "orange", }}
	        onClick={() => setResizeEnabled(!resizeEnabled())}>
                 {resizeEnabled() ? "disable" : "enable"} resize
            </button>
            <button  class={styles.Button} 
                onClick={() =>
                    setPosition({
                        x: 150,
                        y: 200,
                    })
                }
            >
                 jump to (150, 200)
            </button>
            <button class={styles.Button} 
                onClick={() =>
                    setState({
                        x: 100,
                        y: 100,
                        width: 100,
                        height: 100,
                    })
                }
            >
                 jump to (100, 100) with size (100, 100)
            </button>
            <button  class={styles.Button} style={{  "background-color": handleEnabled() ? "white" : "orange", }}
	        onClick={() => setHandleEnabled(!handleEnabled())}>
                 {handleEnabled() ? "disable" : "enable"} the drag handle
            </button>
            <button  class={styles.Button} 
	        onClick={() => console.log(reference)}> console log element ref</button>
            <button  class={styles.Button} style={{  "background-color": boundaries() ? "white" : "orange", }}
	        onClick={() => setBoundaries(!boundaries())}>
                 toggle parent/window boundaries
            </button>
            <button  class={styles.Button} style={{  "background-color": userSelect() ? "white" : "orange", }}
	        onClick={() => setUserSelect(!userSelect())}>
                 {userSelect() ? "disable" : "enable"} user select: none when moving
            </button>
            <button  class={styles.Button} style={{  "background-color": rightHandlesOnly() ? "white" : "orange", }}
	        onClick={() => setRightHandlesOnly(!rightHandlesOnly())}>
                 enable {rightHandlesOnly() ? "only the right handle resize handles" : "all of the resize handles"}
            </button>
        </div>
	 <br/>
	<div style={{ width:"800px", height:"300px", "background-color": "gray",}} >
            <DragAndResize
                //class={styles.DragAndResize + " " + className()}
                class={ className()}
                style={{
                    //"border-radius": "0.5rem",
                    "background-color": "yellow",
                    //"overflow": "hidden",
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
                initialState={{ x: 10, y: 10, width: 250, height: 150 }}
                minSize={{ width: 80, height: 80 }}
                //maxSize={{ width: 500, height: 500 }}
                position={position()}
                state={state()}
		
                boundary={
                    boundaries()
                        ? "window"
                        : "parent" 
                }
		
                //boundary="parent"
                dragHandle={handleEnabled() ? ".handle" : undefined}
                classWhileDragging="currentlyDragging"
                classWhileResizing="currentlyResizing"
                dragStart={(e) => {
                    console.log("Drag started parameters:");
                    console.log({ event: e });
                }}
                drag={(e, offset, state) => {
                    console.log("Drag parameters:");
                    //console.log({ event: e, offset: offset, state: state });
                }}
                dragEnd={(e, offset, state) => {
                    console.log("Drag ended parameters");
                    //console.log({ event: e, offset: offset, state: state });
                }}
                resizeStart={(e) => {
                    console.log("Resize started parameters:");
                    //console.log({ event: e });
                }}
                resize={(e, dir, action) => {
                    console.log("Resize parameters:");
                    //console.log({ event: e, direction: dir, action: action });
                }}
                resizeEnd={(e, dir, action) => {
                    console.log("Resize ended parameters:");
                    //console.log({ event: e, direction: dir, action: action });
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
		
		<textarea id="story" name="story" 
                         style={{
			     width:"calc(100% - 5px)",
			     height:"calc(100% - 30px)",
                             "resize": "none",
                         }}

		>
                それは暗い嵐の夜だった...
                </textarea>

            </DragAndResize>
         </div>
        </>
    );
};

export default App;
