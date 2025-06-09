import { useEffect, useState } from 'react';

export function useSessionCollapseState(key: string, defaultState = false) {
  const [isInit, setIsInit] = useState(true);
  const [open, setOpen] = useState(defaultState);

  useEffect(() => {
    const saved = sessionStorage.getItem(key);
    if (saved !== null) {
      setOpen(saved === 'true');
    }
  }, [key]);

  useEffect(() => {
    if (!isInit) {
      sessionStorage.setItem(key, open.toString());
    }
    setIsInit(false);
  }, [open, key, isInit]);

  return [open, setOpen] as const;
}

export function useSessionTabState(key: string, defaultState: string) {
  const [isInit, setIsInit] = useState(true);
  const [value, setValue] = useState(defaultState);

  useEffect(() => {
    const saved = sessionStorage.getItem(key);
    if (saved !== null) {
      setValue(saved);
    }
  }, [key]);

  useEffect(() => {
    if (!isInit) {
      sessionStorage.setItem(key, value.toString());
    }
    setIsInit(false);
  }, [value, key, isInit]);

  return [value, setValue] as const;
}
