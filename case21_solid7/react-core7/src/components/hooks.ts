import { onMount, createSignal, createEffect } from "solid-js";

// Return the document object with SSR.
export const useBrowser = () => {
  const [ok, setOk] = createSignal(false);
  onMount(() => {
    setOk(true);
  });
  if (ok() && typeof window !== "undefined") {
    return { window, document };
  }
  return { window: null, document: null };
};

export const useDebounce = <T>(value: T, delay = 100) => {
  const [debouncedValue, setDebouncedValue] = createSignal(value);
  //const timerRef = useRef<number>(0);
  const timerRef = 0;

  createEffect(() => {
    timerRef.current = window.setTimeout(() => setDebouncedValue(value), delay);
    return () => {
      window.clearTimeout(timerRef.current);
    };
  }, [value, delay]);
  return debouncedValue;
};

export const useDebounceCallback = (
  callback: (...args: any[]) => void,
  delay = 100,
) => {
  let debouncedCallback = callback;
  let timerRef = 0;

  createEffect(() => {
    debouncedCallback = callback;
  }, [callback]);

  return (...args: any[]) => {
    window.clearTimeout(timerRef);
    timerRef = window.setTimeout(() => {
      debouncedCallback(...args);
    }, delay);
  };
};
