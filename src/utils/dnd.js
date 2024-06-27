const withNewItemIds = (column, itemIds) => ({
  id: column.id,
  title: column.title,
  itemIds
});

/**
 * 드래그가 끝났을 때 다중 드래그인지 단일 드래그인지에 따라 재정렬하는 함수
 * @param {Object} args
 *   @property {Array} selectedItemIds - 선택된 요소들의 ids
 *   @property {Object} entities
 *   @property {Object} source - 드래그가 시작된 위치 정보
 *   @property {Object} destination - 드래그가 끝난 위치 정보
 * @returns 재정렬된 data 반환
 */
export const mutliDragAwareReorder = (args) => {
  if (args.selecetedItemIds.length > 1) {
    return reorderMultiDrag(args);
  }
  return reorderSingleDrag(args);
};

// 주어진 아이템 id를 포함하고 있는 컬럼을 찾아 반환 (시작점 obj)
const getHomeColumn = (entities, itemId) => {
  const columnId = entities.columnOrder.find((id) => {
    const column = entities.columns[id];
    return column.itemIds.includes(itemId);
  });

  return entities.columns[columnId];
};

const reorderMultiDrag = ({ entities, selecetedItemIds, source, destination }) => {
  const start = entities.columns[source.droppableId]; // 시작점 obj
  const dragged = start.itemIds[source.index]; // 드래그 시작 id

  // 새로운 위치에 삽입할 인덱스를 계산하는 함수
  const insertAtIndex = (() => {
    const destinationIndexOffset = selecetedItemIds.reduce((previous, current) => {
      // 선택된 요소와 드래그 시작 id가 같은 경우
      if (current === dragged) {
        return previous;
      }

      const final = entities.columns[destination.droppableId]; // 마지막 목적지 obj
      const column = getHomeColumn(entities, current); // 선택된 obj

      // 선택된 obj와 마지막 목적지 obj가 다른 경우
      if (column !== final) {
        return previous;
      }

      // 같은 곳 이동한 경우
      const index = column.itemIds.indexOf(current); // 선택된 obj에서 선택된 item의 index

      // 선택된 index가 목적지보다 뒤에 있거나 같은 경우 (앞으로 이동한 경우)
      if (index >= destination.index) {
        return previous;
      }

      // 선택된 index가 목적지보다 앞에 있는 경우 (뒤로 이동한 경우)
      return previous + 1;
    }, 0);

    // 목적지 index - 선택된 index가 목적지보다 앞에 있는 경우 (뒤로 이동한 경우)
    const result = destination.index - destinationIndexOffset;
    return result;
  })();

  const orderedSelectedItemIds = [...selecetedItemIds];

  // 모든 선택된 항목들을 원래 columns 위치에서 제거
  const withRemovedItems = entities.columnOrder.reduce((previous, columnId) => {
    const column = entities.columns[columnId];
    const remainingItemIds = column.itemIds.filter((id) => !selecetedItemIds.includes(id));

    previous[column.id] = withNewItemIds(column, remainingItemIds);
    return previous;
  }, entities.columns);

  const final = withRemovedItems[destination.droppableId]; // 목적지 컬럼 obj
  const withInserted = (() => {
    const base = [...final.itemIds];
    base.splice(insertAtIndex, 0, ...orderedSelectedItemIds); // 새로운 위치에 선택된 항목들을 삽입
    return base;
  })();

  // 모든 선택된 항목들을 최종 컬럼에 삽입
  const withAddedItems = {
    ...withRemovedItems,
    [final.id]: withNewItemIds(final, withInserted)
  };

  const updated = {
    ...entities,
    columns: withAddedItems
  };

  return {
    entities: updated,
    selecetedItemIds: orderedSelectedItemIds
  };
};

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1); // startIndex 위치에서 1개 제거
  result.splice(endIndex, 0, removed); // endIndex 위치에 removed 추가

  return result;
};

const reorderSingleDrag = ({ entities, selecetedItemIds, source, destination }) => {
  // 같은 column안에서 이동한 경우
  if (source.droppableId === destination.droppableId) {
    const column = entities.columns[source.droppableId]; // 이동한 칼럼
    const reordered = reorder(column.itemIds, source.index, destination.index);

    const updated = {
      ...entities,
      columns: {
        ...entities.columns,
        [column.id]: withNewItemIds(column, reordered)
      }
    };

    return {
      entities: updated,
      selecetedItemIds
    };
  }

  // 다른 칼럼으로 이동한 경우
  const home = entities.columns[source.droppableId]; // 시작 obj
  const foreign = entities.columns[destination.droppableId]; // 목적 obj

  // 이동할 항목의 id
  const itemId = home.itemIds[source.index];

  // home에서 제거
  const newHomeItemIds = [...home.itemIds];
  newHomeItemIds.splice(source.index, 1);

  // destColumn에 추가
  const newForeignItemIds = [...foreign.itemIds];
  newForeignItemIds.splice(destination.index, 0, itemId);

  const updated = {
    ...entities,
    columns: {
      ...entities.columns,
      [home.id]: withNewItemIds(home, newHomeItemIds),
      [foreign.id]: withNewItemIds(foreign, newForeignItemIds)
    }
  };

  return {
    entities: updated,
    selecetedItemIds
  };
};

/**
 * shift키로 다중 선택 시 선택된 요소들을 반환하는 함수
 * @param {Object} entities
 * @param {Array} selecetedItemIds 현재 선택된 요소들의 ids
 * @param {*} newItemId 새로 선택된 요소 id
 * @returns 새로 선택된 요소들의 ids 반환
 */
export const multiSelect = (entities, selecetedItemIds, newItemId) => {
  // 현재 선택된 요소가 없다면 새로 선택된 요소 id만 리턴
  if (!selecetedItemIds.length) {
    return [newItemId];
  }

  const columnOfNew = getHomeColumn(entities, newItemId); // 새로 선택된 요소 obj
  const indexOfNew = columnOfNew.itemIds.indexOf(newItemId); // 새로 선택된 요소 index

  const lastSelected = selecetedItemIds[selecetedItemIds.length - 1];
  const columnOfLast = getHomeColumn(entities, lastSelected); // 마지막 선택된 요소 obj
  const indexOfLast = columnOfLast.itemIds.indexOf(lastSelected); // 마지막 선택된 요소 index

  // 다른 컬럼으로 다중 선택하는 경우
  // 그 컬럼의 처음부터 새로 선택된 항목까지의 모든 항목을 선택
  if (columnOfNew !== columnOfLast) {
    return columnOfNew.itemIds.slice(0, indexOfNew + 1);
  }

  // 같은 컬럼에서 shift하는 경우
  // 같은 컬럼 같은 index
  if (indexOfNew === indexOfLast) {
    return null;
  }

  const isSelectingForwards = indexOfNew > indexOfLast; // 순차적으로 선택했는지
  const start = isSelectingForwards ? indexOfLast : indexOfNew;
  const end = isSelectingForwards ? indexOfNew : indexOfLast;

  const inBetween = columnOfNew.itemIds.slice(start, end + 1); // 사이에 선택된 요소들

  // 사이 선택된 요소들에서 첫번째 선택된 요소 제거
  const toAdd = inBetween.filter((itemId) => !selecetedItemIds.includes(itemId));

  const combined = isSelectingForwards
    ? [...selecetedItemIds, ...toAdd]
    : [...toAdd, ...selecetedItemIds];

  return combined;
};
