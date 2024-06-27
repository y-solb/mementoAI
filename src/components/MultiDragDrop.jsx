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
  const [isDropDisabled, setIsDropDisabled] = useState(false); // drop이 불가능한지
  const [entities, setEntities] = useState(initialData);
  const [selecetedItemIds, setSeletedItemIds] = useState([]); // 선택된 ids
  const [draggingId, setDraggingId] = useState(null); // 최종 선택된 id

  const handleWindowClick = useCallback((event) => {
    if (event.defaultPrevented) {
      // event.preventDefault()로 기본 동작이 취소된 경우 return, 이벤트가 중복 처리 방지
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
        destination.droppableId === source.droppableId ? destination.index + 1 : destination.index; // 같은 열에 있다면 index+1/index, 다음 아이템의 index
      const nextItemId = entities.columns[destination.droppableId].itemIds[nextIndex];

      return (
        (source.droppableId === 'column-1' && destination.droppableId === 'column-3') ||
        (nextItemId && isEven(draggableId) && isEven(nextItemId))
      );
    },
    [entities.columns]
  );

  // 단일 선택
  const toggleSelection = (itemId) => {
    const wasSelected = selecetedItemIds.includes(itemId); // 이전에 선택되었는지

    // 이전에 선택되지 않았거나 선택된 아이템들이 있다면 대체
    const newItemIds = !wasSelected || selecetedItemIds.length > 1 ? [itemId] : [];
    setSeletedItemIds(newItemIds);
  };

  // ctrl키로 선택 시
  const toggleSelectionInGroup = (itemId) => {
    const index = selecetedItemIds.indexOf(itemId);

    // 기존에 선택하지 않았다면 추가
    if (index === -1) {
      setSeletedItemIds([...selecetedItemIds, itemId]);
      return;
    }

    // 기존에 선택되어 제거
    const filteredItems = selecetedItemIds.filter((id) => id !== itemId);
    setSeletedItemIds(filteredItems);
  };

  // shift키로 선택 시
  const multiSelectTo = (newItemId) => {
    const updated = multiSelect(entities, selecetedItemIds, newItemId); // 선택된 ids

    if (updated == null) {
      return;
    }
    setSeletedItemIds(updated);
  };

  // draggableId: 선택된 id
  // source: 시작점
  // destination: 목적지
  const handleDragStart = useCallback(
    (start) => {
      const { draggableId } = start;
      const selected = selecetedItemIds.find((itemId) => itemId === draggableId);

      // 여러 개 선택 후 다른 거 하나 이동 시
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

      // 조건에 부합하지 않는다면 true
      if (isDragDisallowed(source, destination, draggableId)) {
        setIsDropDisabled(true);
        return;
      }

      // isDropDisabled 초기화
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
      // setSeletedItemIds(processed.selecetedItemIds);
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

// [ {id: 'item-0', content: 'item 0'} ,{id: 'item-1', content: 'item 1'}, ... ]
const getItems = (entities, columnId) =>
  entities.columns[columnId].itemIds?.map((itemId) => entities.items[itemId]);

// 짝수인지
const isEven = (str) => {
  return Number(str.replace('item-', '')) % 2 === 0;
};

export default MultiDragDrop;
