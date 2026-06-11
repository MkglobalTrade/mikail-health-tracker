import { useEffect, useState } from 'react';

export function useLabs() {
  const [data, setData] = useState([]);
  useEffect(() => { setData([]); }, []);
  return { data };
}
