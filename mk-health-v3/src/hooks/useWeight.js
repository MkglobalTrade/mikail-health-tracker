import { useState, useEffect } from 'react';

export function useWeight() {
  const [data, setData] = useState([]);
  useEffect(() => {
    setData([]);
  }, []);
  return { data };
}
