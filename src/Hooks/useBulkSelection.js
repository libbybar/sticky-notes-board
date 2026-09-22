import { useState } from 'react';

export const useBulkSelection = () => {
    const [selectedIds, setSelectedIds] = useState([]);
    const [isSelectionMode, setIsSelectionMode] = useState(false);

    const toggleSelection = (id) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(selectedId => selectedId !== id) : [...prev, id]
        );
    };

    const toggleMode = () => {
        setIsSelectionMode(prev => !prev);
        setSelectedIds([]);
    };

    const clearSelection = () => setSelectedIds([]);

    return {
        selectedIds,
        isSelectionMode,
        toggleSelection,
        toggleMode,
        clearSelection
    };
};