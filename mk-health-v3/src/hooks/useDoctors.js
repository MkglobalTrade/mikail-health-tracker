import { useState, useEffect } from 'react';

export function useDoctors() {
  const [data, setData] = useState([]);
  useEffect(() => {
    setData([]);
  }, []);
  return { data };
}
