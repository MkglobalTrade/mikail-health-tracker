import { useEffect, useState } from 'react';

export function useMedications() {
  const [data, setData] = useState([]);
  useEffect(() => { setData([]); }, []);
  return { data };
}
