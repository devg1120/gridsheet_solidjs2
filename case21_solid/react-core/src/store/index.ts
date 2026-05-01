import { StoreType } from "../types";
import { createContext } from "solid-js";
/*
export type Dispatcher = React.Dispatch<{
    type: number;
    value: any;
}>;
*/

export type Dispatcher ={
    type: number;
    value: any;
};

export const Context = createContext(
    {} as {
        store: StoreType;
        dispatch: Dispatcher;
    },
);

console.log(Context)

