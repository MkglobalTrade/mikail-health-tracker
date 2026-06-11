import { useEffect, useState } from 'react';

export function useWeight() {
  const [data, setData] = useState([]);
  useEffect(() => { setData([]); }, []);
  return { data };
}
