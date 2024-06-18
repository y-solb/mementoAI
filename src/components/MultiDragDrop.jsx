import { useState, useEffect, useCallback } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import Column from './Column';
import { isDragAllowed, mutliDragAwareReorder, multiSelect } from '../utils/dnd';
import { initialData } from '../data/dnd';

const getItems = (entities, columnId) =>
  entities.columns[columnId].itemIds?.map((itemId) => entities.items[itemId]);

const MultiDragDrop = () => {
  const [isDropDisabled, setIsDropDisabled] = useState(false);
  const [entities, setEntities] = useState(initialData);
  const [selecetedItemIds, setSeletedItemIds] = useState([]);
  const [draggingId, setDraggingId] = useState(null);

  const handleWindowClick = useCallback((event) => {
    if (event.defaultPrevented) {
      return;
    }

    resetSelectedItems();
  }, []);

  const handleWindowKeyDown = useCallback((event) => {
    if (event.defaultPrevented) {
      return;
    }

    if (event.key === 'Escape') {
      resetSelectedItems();
    }
  }, []);

  const handleWindowTouchEnd = useCallback((event) => {
    if (event.defaultPrevented) {
      return;
    }

    resetSelectedItems();
  }, []);

  useEffect(() => {
    window.addEventListener('click', handleWindowClick);
    window.addEventListener('keydown', handleWindowKeyDown);
    window.addEventListener('touchend', handleWindowTouchEnd);

    return () => {
      window.removeEventListener('click', handleWindowClick);
      window.removeEventListener('keydown', handleWindowKeyDown);
      window.removeEventListener('touchend', handleWindowTouchEnd);
    };
  }, [handleWindowClick, handleWindowKeyDown, handleWindowTouchEnd]);

  const resetSelectedItems = () => {
    setSeletedItemIds([]);
  };

  const toggleSelection = (itemId) => {
    const wasSelected = selecetedItemIds.includes(itemId);

    const newItemIds = (() => {
      // 이전에 선택되지 않음
      if (!wasSelected) {
        return [itemId];
      }

      // 선택 item 변경
      if (selecetedItemIds.length > 1) {
        return [itemId];
      }

      // 선택 해제
      return [];
    })();

    setSeletedItemIds(newItemIds);
  };

  const toggleSelectionInGroup = (itemId) => {
    const index = selecetedItemIds.indexOf(itemId);

    // 기존에 선택하지 않았다면 추가
    if (index === -1) {
      setSeletedItemIds([...selecetedItemIds, itemId]);
      return;
    }

    // 기존에 선택되어 제거
    const shallow = [...selecetedItemIds];
    shallow.splice(index, 1);
    setSeletedItemIds(shallow);
  };

  const multiSelectTo = (newItemId) => {
    const updated = multiSelect(entities, selecetedItemIds, newItemId);

    if (updated == null) {
      return;
    }
    setSeletedItemIds(updated);
  };

  const handleDragStart = useCallback(
    (start) => {
      const { draggableId } = start;
      const selected = selecetedItemIds.find((itemId) => itemId === draggableId);

      if (!selected) {
        resetSelectedItems();
      }

      setDraggingId(draggableId);
      setIsDropDisabled(false);
    },
    [selecetedItemIds]
  );

  const handleDragUpdate = useCallback(
    (update) => {
      const { destination, source, draggableId } = update;
      if (!destination) return;

      const nextItemId = entities.columns[destination.droppableId].itemIds[destination.index];
      if (isDragAllowed(source.droppableId, destination.droppableId, draggableId, nextItemId)) {
        setIsDropDisabled(true);
        return;
      }

      setIsDropDisabled(false);
    },
    [entities]
  );

  const handleDragEnd = useCallback(
    (result) => {
      const { source, destination, draggableId } = result;
      if (!destination) {
        setDraggingId(null);
        return;
      }

      const nextItemId = entities.columns[destination.droppableId].itemIds[destination.index];
      if (isDragAllowed(source.droppableId, destination.droppableId, draggableId, nextItemId)) {
        return;
      }

      const processed = mutliDragAwareReorder({
        entities,
        selecetedItemIds,
        source,
        destination
      });

      setEntities(processed.entities);
      setSeletedItemIds(processed.selecetedItemIds);
      setDraggingId(null);
    },
    [entities, selecetedItemIds]
  );

  return (
    <DragDropContext
      onDragStart={handleDragStart}
      onDragUpdate={handleDragUpdate}
      onDragEnd={handleDragEnd}>
      <div style={{ display: 'flex', gap: '20px' }}>
        {entities.columnOrder.map((columnId) => (
          <Column
            key={columnId}
            column={entities.columns[columnId]}
            items={getItems(entities, columnId)}
            selecetedItemIds={selecetedItemIds}
            isDropDisabled={isDropDisabled}
            draggingId={draggingId}
            toggleSelection={toggleSelection}
            toggleSelectionInGroup={toggleSelectionInGroup}
            multiSelectTo={multiSelectTo}
          />
        ))}
      </div>
    </DragDropContext>
  );
};

export default MultiDragDrop;
