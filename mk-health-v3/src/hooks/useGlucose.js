import { useState, useEffect } from 'react';

export function useGlucose() {
  const [data, setData] = useState([]);
  useEffect(() => {
    setData([]);
  }, []);
  return { data };
}
