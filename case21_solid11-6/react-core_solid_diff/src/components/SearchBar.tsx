import { a2p } from "../lib/converters";
import { Context } from "../store";
import { setSearchQuery, search, setSearchCaseSensitive } from "../store/actions";
import { smartScroll } from "../lib/virtualization";
import { SearchIcon } from "./svg/SearchIcon";
import { CloseIcon } from "./svg/CloseIcon";
import { useContext, createEffect, on } from "solid-js";

export const SearchBar = () => {
    const { store, dispatch } = useContext(Context);
    const {
        rootRef,
        editorRef,
        searchInputRef,
        tabularRef,
        searchQuery,
        searchCaseSensitive,
        matchingCellIndex,
        matchingCells,
        tableReactive: tableRef,
    } = store;
    const table = tableRef.current;

    const matchingCell = matchingCells[matchingCellIndex];
    createEffect(on(
        () => [searchQuery, matchingCellIndex, searchCaseSensitive, table, tabularRef],
        () => {
            if (!matchingCell || !table) {
                return;
            }
            const point = a2p(matchingCell);
            if (typeof point === "undefined") {
                return;
            }
            smartScroll(table, tabularRef.current, point);
        }
    ));

    const handleProgressClick = ((e: React.MouseEvent) => {
        const input = e.currentTarget.previousSibling as HTMLInputElement;
        input?.nodeName === "INPUT" && input.focus();
    });

    const handleSearchClick = (() => {
        dispatch(search(1));
    });

    const handleChange = (
        (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            dispatch(setSearchQuery(e.currentTarget.value));
        }
    );

    const handleKeyDown = (
        (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.key === "Escape") {
                const el = editorRef?.current;
                if (el) {
                    el.focus();
                }
                dispatch(setSearchQuery(undefined));
            }
            if (e.key === "f" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                return false;
            }
            if (e.key === "Enter") {
                dispatch(search(e.shiftKey ? -1 : 1));
                e.preventDefault();
                return false;
            }
            return true;
        }
    );

    const handleCaseSensitiveClick = (() => {
        dispatch(setSearchCaseSensitive(!searchCaseSensitive));
    });

    const handleCloseClick = (() => {
        dispatch(setSearchQuery(undefined));
        editorRef.current?.focus();
    });

    if (typeof searchQuery === "undefined") {
        return null;
    }
    if (rootRef.current === null) {
        return null;
    }
    return (
        <label
            class={`gs-search-bar ${matchingCells.length > 0 ? "gs-search-found" : ""}`}
        >
            <div class="gs-search-progress" onClick={handleProgressClick}>
                {matchingCells.length === 0 ? 0 : matchingCellIndex + 1} /{" "}
                {matchingCells.length}
            </div>
            <div class="gs-search-bar-icon" onClick={handleSearchClick}>
                <SearchIcon style={{
                    verticalAlign: "middle",
                    marginLeft: "5px"
                }} />
            </div>
            <textarea
                ref={searchInputRef}
                value={searchQuery}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
            ></textarea>
            <div class={`gs-search-casesensitive`}>
                <span
                    class={`${searchCaseSensitive ? "gs-search-casesensitive-on" : ""}`}
                    onClick={handleCaseSensitiveClick}
                >
                    Aa
                </span>
            </div>
            <a class="gs-search-close" onClick={handleCloseClick}>
                <CloseIcon style={{ verticalAlign: "middle" }} />
            </a>
        </label>
    );
};
