import { useState, useEffect } from 'react';

export function useBloodPressure() {
  const [data, setData] = useState([]);
  useEffect(() => {
    setData([]);
  }, []);
  return { data };
}
