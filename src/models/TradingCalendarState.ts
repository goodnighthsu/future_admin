import {useCallback, useState} from 'react';

export default() => {
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const updateSelectedYear = useCallback((year: number) => {
        setSelectedYear(year);
    }, [selectedYear]);

    return {
        selectedYear,
        updateSelectedYear,
    }
}