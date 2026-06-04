import { useBrowser } from "./hooks";
//import { createPortal } from "react-dom";
import { Portal } from "solid-js/web";
import { JSXElement } from "solid-js";

type Props = {
    className?: string;
    style?: CSSProperties;
    children: JSXElement;
    [attr: string]: any;
};

export const Fixed: FC<Props> = ({
    children,
    style,
    className = "",
    ...attrs
}) => {
    const { document } = useBrowser();
    if (document == null) {
        return null;
    }
   /*
    return createPortal(
        <div {...attrs} class={`gs-fixed ${className}`} style={style}>
            {children}
        </div>,
        document.body,
    );
    */
        <Portal>
        <div {...attrs} class={`gs-fixed ${className}`} style={style}>
            {children}
        </div>,
        </Portal>

};
