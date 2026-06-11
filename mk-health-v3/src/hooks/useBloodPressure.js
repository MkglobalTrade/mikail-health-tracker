import { useEffect, useState } from 'react';

export function useBloodPressure() {
  const [data, setData] = useState([]);
  useEffect(() => { setData([]); }, []);
  return { data };
}
