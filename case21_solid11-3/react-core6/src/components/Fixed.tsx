import { useBrowser } from "./hooks";
//import { createPortal } from "react-dom";
import { Portal } from "solid-js/web";
import { JSXElement } from "solid-js";

type Props = {
  className?: string;
  style?: CSSProperties;
  table: any;
  children: JSXElement;
  [attr: string]: any;
};

export const Fixed: FC<Props> = ({
  children,
  style,
  table,
  className = "",
  ...attrs
}) => {

/*
  const { document } = useBrowser();
  if (document == null) {
     console.log("****************");
    return null;
  }
  */
  /*
    return createPortal(
        <div {...attrs} class={`gs-fixed ${className}`} style={style}>
            {children}
        </div>,
        document.body,
    );

  <Portal mount={document.window}>
    <div id="gusa" {...attrs} class={`gs-fixed ${className}`} style={style}>
      {children}
    </div>
  </Portal>

    */
return (
  <Portal mount={document.body}>
    <div  {...attrs} class={`gs-fixed ${className}`} style={style}>
      {children}
    </div>
  </Portal>
 )
};
