import { useState, useEffect, useCallback } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import Column from './Column';
import { mutliDragAwareReorder, multiSelect } from '../utils/dnd';
import { initialData } from '../data/dnd';
import styled from 'styled-components';

const DragDropWrapper = styled.div`
  display: flex;
  gap: 20px;
`;

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

  // 첫 번째 칼럼에서 세 번째 칼럼으로는 아이템 이동이 불가능해야 합니다.
  // 짝수 아이템은 다른 짝수 아이템 앞으로 이동할 수 없습니다.
  const isDragDisallowed = useCallback(
    (source, destination, draggableId) => {
      const nextIndex =
        destination.droppableId === source.droppableId ? destination.index + 1 : destination.index;
      const nextItemId = entities.columns[destination.droppableId].itemIds[nextIndex];

      return (
        (source.droppableId === 'column-1' && destination.droppableId === 'column-3') ||
        (nextItemId && isEven(draggableId) && isEven(nextItemId))
      );
    },
    [entities.columns]
  );

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

      if (isDragDisallowed(source, destination, draggableId)) {
        setIsDropDisabled(true);
        return;
      }

      setIsDropDisabled(false);
    },
    [isDragDisallowed]
  );

  const handleDragEnd = useCallback(
    (result) => {
      const { source, destination, draggableId } = result;
      if (!destination) {
        setDraggingId(null);
        return;
      }

      if (isDragDisallowed(source, destination, draggableId)) {
        setDraggingId(null);
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
    [entities, isDragDisallowed, selecetedItemIds]
  );

  return (
    <DragDropContext
      onDragStart={handleDragStart}
      onDragUpdate={handleDragUpdate}
      onDragEnd={handleDragEnd}>
      <DragDropWrapper>
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
      </DragDropWrapper>
    </DragDropContext>
  );
};

const getItems = (entities, columnId) =>
  entities.columns[columnId].itemIds?.map((itemId) => entities.items[itemId]);

const isEven = (str) => {
  return Number(str.replace('item-', '')) % 2 === 0;
};

export default MultiDragDrop;
