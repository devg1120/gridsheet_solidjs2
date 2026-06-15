import { Dynamic, render } from "solid-js/web";
import { type VoidComponent, onMount, For, type ParentComponent, createSignal, batch } from "solid-js";

//import { PanelGroup, PanelGroupAPI, Panel, ResizeHandle } from "solid-resizable-panels";

import { PanelGroup, type PanelGroupAPI, Panel, ResizeHandle } from "./lib";

import "./lib/styles.css";
import "./styles.css";



const CodeExample: VoidComponent<{ ExampleComponent: VoidComponent; code: string }> = (props) => (
  <>
    <Dynamic component={props.ExampleComponent} />
    <h3>Code</h3>
    <pre>
      <code class="language-tsx">{props.code}</code>
    </pre>
  </>
);

const Section: ParentComponent<{ title: string; slug: string }> = (props) => (
  <>
    <h2 id={props.slug}>
      <a href={`#${props.slug}`}>{props.title}</a>
    </h2>
    {props.children}
  </>
);


const v_resize = (id, size) => {
      console.log("..  v_resize", id,size);
}

const h_resize = (id, size) => {
      console.log("   ..  h_resize", id,size);
}
//const EXAMPLES: { ExampleComponent: VoidComponent; title: string; slug: string }[] = DEBUG()
const EXAMPLES: { ExampleComponent: VoidComponent; title: string; slug: string }[] = 
[
   [
      {
        title: "DEBUG example",
        slug: "debug",
        ExampleComponent: () => (
          <CodeExample
            ExampleComponent={() => (
              <PanelGroup direction="column">
                   <Panel id="1" onResize={(size) => v_resize("1", size)}>
                      <PanelGroup>
                        <Panel id="11" onResize={(size) => h_resize("11", size)}>
			    Panel 11
			</Panel>
                        <ResizeHandle />
                        <Panel id="12" onResize={(size) => h_resize("12", size)}>
			    Panel 12
			</Panel>
                      </PanelGroup>
                   </Panel>
                <ResizeHandle />
                   <Panel id="2" onResize={(size) => v_resize("2", size)}>
                      <PanelGroup>
                        <Panel id="21" onResize={(size) => h_resize("21", size)}>
			    Panel 21
			</Panel>
                        <ResizeHandle />
                        <Panel id="22" onResize={(size) => h_resize("22", size)}>
			    Panel 22
			</Panel>
                      </PanelGroup>
                   </Panel>
              </PanelGroup>
            )}
            code={String.raw`
              <PanelGroup direction="column">
                   <Panel id="1">
                      <PanelGroup>
                        <Panel id="11">Panel 11</Panel>
                        <ResizeHandle />
                        <Panel id="12">Panel 12</Panel>
                      </PanelGroup>
                   </Panel>
                <ResizeHandle />
                   <Panel id="2">
                      <PanelGroup>
                        <Panel id="21">Panel 21</Panel>
                        <ResizeHandle />
                        <Panel id="22">Panel 22</Panel>
                      </PanelGroup>
                   </Panel>
              </PanelGroup>
`}
          />
        ),
      },
      //------------------------------------
    ]
    ,
    [
      {
        title: "Basic example",
        slug: "basic",
        ExampleComponent: () => (
          <CodeExample
            ExampleComponent={() => (
              <PanelGroup>
                <Panel id="1">Panel 1</Panel>
                <ResizeHandle />
                <Panel id="2">Panel 2</Panel>
                <ResizeHandle />
                <Panel id="3">Panel 3</Panel>
              </PanelGroup>
            )}
            code={String.raw`<PanelGroup>
  <Panel id="1">Panel 1</Panel>
  <ResizeHandle />
  <Panel id="2">Panel 2</Panel>
  <ResizeHandle />
  <Panel id="3">Panel 3</Panel>
</PanelGroup>`}
          />
        ),
      },
      {
        title: "Vertical layout",
        slug: "vertical-layout",
        ExampleComponent: () => (
          <CodeExample
            ExampleComponent={() => (
              <PanelGroup direction="column">
                <Panel id="1">Panel 1</Panel>
                <ResizeHandle />
                <Panel id="2">Panel 2</Panel>
                <ResizeHandle />
                <Panel id="3">Panel 3</Panel>
              </PanelGroup>
            )}
            code={String.raw`<PanelGroup direction="column">
  <Panel id="1">Panel 1</Panel>
  <ResizeHandle />
  <Panel id="2">Panel 2</Panel>
  <ResizeHandle />
  <Panel id="3">Panel 3</Panel>
</PanelGroup>`}
          />
        ),
      },
      {
        title: "Min and max size",
        slug: "min-max-size",
        ExampleComponent: () => (
          <CodeExample
            ExampleComponent={() => (
              <PanelGroup>
                <Panel id="1" initialSize={30} minSize={20} maxSize={30}>
                  Panel 1
                </Panel>
                <ResizeHandle />
                <Panel id="2" minSize={20} maxSize={70}>
                  Panel 2
                </Panel>
                <ResizeHandle />
                <Panel id="3" minSize={20}>
                  Panel 3
                </Panel>
              </PanelGroup>
            )}
            code={String.raw`<PanelGroup>
  <Panel id="1" initialSize={30} minSize={20} maxSize={30}>
    Panel 1
  </Panel>
  <ResizeHandle />
  <Panel id="2" minSize={20} maxSize={70}>
    Panel 2
  </Panel>
  <ResizeHandle />
  <Panel id="3" minSize={20}>
    Panel 3
  </Panel>
</PanelGroup>`}
          />
        ),
      },
      {
        title: "Nested layout",
        slug: "nested-layout",
        ExampleComponent: () => (
          <CodeExample
            ExampleComponent={() => (
              <PanelGroup direction="column">
                <Panel id="1">Panel 1</Panel>
                <ResizeHandle />
                <Panel id="2">
                  <PanelGroup>
                    <Panel id="1">Panel 1</Panel>
                    <ResizeHandle />
                    <Panel id="2">Panel 2</Panel>
                    <ResizeHandle />
                    <Panel id="3">Panel 3</Panel>
                  </PanelGroup>
                </Panel>
                <ResizeHandle />
                <Panel id="3">Panel 3</Panel>
              </PanelGroup>
            )}
            code={String.raw`<PanelGroup direction="column">
  <Panel id="1">Panel 1</Panel>
  <ResizeHandle />
  <Panel id="2">
    <PanelGroup>
      <Panel id="1">Panel 1</Panel>
      <ResizeHandle />
      <Panel id="2">Panel 2</Panel>
      <ResizeHandle />
      <Panel id="3">Panel 3</Panel>
    </PanelGroup>
  </Panel>
  <ResizeHandle />
  <Panel id="3">Panel 3</Panel>
</PanelGroup>`}
          />
        ),
      },
      {
        title: "Collapsible panels",
        slug: "collapsible-panels",
        ExampleComponent: () => (
          <CodeExample
            ExampleComponent={() => (
              <PanelGroup>
                <Panel id="1" minSize={20} collapsible>
                  Panel 1
                </Panel>
                <ResizeHandle />
                <Panel id="2" minSize={20}>
                  Panel 2
                </Panel>
                <ResizeHandle />
                <Panel id="3" minSize={20} collapsible>
                  Panel 3
                </Panel>
              </PanelGroup>
            )}
            code={String.raw`<PanelGroup>
  <Panel id="1" minSize={20} collapsible>
    Panel 1
  </Panel>
  <ResizeHandle />
  <Panel id="2" minSize={20}>
    Panel 2
  </Panel>
  <ResizeHandle />
  <Panel id="3" minSize={20} collapsible>
    Panel 3
  </Panel>
</PanelGroup>`}
          />
        ),
      },
      {
        title: "Imperative API",
        slug: "imperative-api",
        ExampleComponent: () => (
          <CodeExample
            ExampleComponent={() => {
              const [api, setAPI] = createSignal<PanelGroupAPI>();

              const [isPanelCollapsed, setPanelCollapsed] = createSignal(false);
              const [isPanelExpanded, setPanelExpanded] = createSignal(false);

              return (
                <div>
                  <button disabled={isPanelCollapsed()} onClick={() => api()?.collapse("1")}>
                    Collapse panel 1
                  </button>
                  <button disabled={isPanelExpanded()} onClick={() => api()?.expand("1", 20)}>
                    Expand panel by 20%
                  </button>
                  <button onClick={() => api()?.setLayout([20, 20, 60])}>Set layout</button>
                  <PanelGroup
                    setAPI={setAPI}
                    logger={console}
                    onLayoutChange={(layout) =>
                      batch(() => {
                        setPanelCollapsed(layout[0] === 0);
                        setPanelExpanded(layout[0] !== 0);
                      })
                    }
                  >
                    <Panel id="1" collapsible minSize={20}>
                      Panel 1
                    </Panel>
                    <ResizeHandle />
                    <Panel id="2" minSize={20}>
                      Panel 2
                    </Panel>
                    <ResizeHandle />
                    <Panel id="3" minSize={20} collapsible>
                      Panel 3
                    </Panel>
                  </PanelGroup>
                </div>
              );
            }}
	    
            code={String.raw`const [api, setAPI] = createSignal<PanelGroupAPI>();

const [isPanelCollapsed, setPanelCollapsed] = createSignal(false);
const [isPanelExpanded, setPanelExpanded] = createSignal(false);

return (
  <div>
    <button disabled={isPanelCollapsed()} onClick={() => api()?.collapse("1")}>
      Collapse panel 1
    </button>
    <button disabled={isPanelExpanded()} onClick={() => api()?.expand("1", 20)}>
      Expand panel by 20%
    </button>
    <button onClick={() => api()?.setLayout([20, 20, 60])}>Set layout</button>
    <PanelGroup
      setAPI={setAPI}
      logger={console}
      onLayoutChange={(layout) =>
        batch(() => {
          setPanelCollapsed(layout[0] === 0);
          setPanelExpanded(layout[0] !== 0);
        })
      }
    >
      <Panel id="1" collapsible minSize={20}>
        Panel 1
      </Panel>
      <ResizeHandle />
      <Panel id="2" minSize={20}>
        Panel 2
      </Panel>
      <ResizeHandle />
      <Panel id="3" minSize={20} collapsible>
        Panel 3
      </Panel>
    </PanelGroup>
  </div>
);`}
          />
        ),
      },
    ]
    ];

  const [DEBUG, SETDEBUG] = createSignal(true);
  const [index, setIndex] = createSignal(0);
  const changemode = () => {
       if (DEBUG()) {
          SETDEBUG(false);
	  setIndex(1);
	  console.log("DEBUG", DEBUG());
       } else {
          SETDEBUG(true);
	  setIndex(0);
	  console.log("DEBUG", DEBUG());
       }
  };

const App = () => (
  <main>
    <h1>solid-resizable-panels</h1>
    <p>GUSA A set of components for Solid.JS to make resizable layouts.</p>
    <button onClick={changemode}>{DEBUG() ? "DEBUG" : "Exsamples"} </button>
    <h2>Contents</h2>
    <ol>
      <For each={EXAMPLES[index()]}>
        {(example) => (
          <li>
            <h3>
              <a href={`#${example.slug}`}>{example.title}</a>
            </h3>
          </li>
        )}
      </For>
    </ol>
    <For each={EXAMPLES[index()]}>
      {(example) => (
        <>
          <Section title={example.title} slug={example.slug}>
            <Dynamic component={example.ExampleComponent} />
          </Section>
        </>
      )}
    </For>
  </main>
);

render(() => <App />, document.getElementById("root")!);
