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
  return (
    <Portal mount={document.body}>
      <div {...attrs} class={`gs-fixed ${className}`} style={style}>
        {children}
      </div>
    </Portal>
  );
};
