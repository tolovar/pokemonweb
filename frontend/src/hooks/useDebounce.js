import { useEffect, useRef } from "react";

export default function useDebounce(callback, delay, options = { trailing: true }) {
  const timeoutRef = useRef();

  useEffect(() => {
    if (!options.trailing) return;
    return () => clearTimeout(timeoutRef.current);
  }, [options.trailing]);

  return (...args) => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  };
}