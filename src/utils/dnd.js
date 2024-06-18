const withNewItemIds = (column, itemIds) => ({
  id: column.id,
  title: column.title,
  itemIds
});

const isEven = (str) => {
  return Number(str.replace('item-', '')) % 2 === 0;
};

// 첫 번째 칼럼에서 세 번째 칼럼으로는 아이템 이동이 불가능해야 합니다.
// 짝수 아이템은 다른 짝수 아이템 앞으로 이동할 수 없습니다.
export const isDragAllowed = (
  sourceDroppableId,
  destinationDroppableId,
  draggableId,
  nextItemId
) => {
  return (
    (sourceDroppableId === 'column-1' && destinationDroppableId === 'column-3') ||
    (nextItemId && isEven(draggableId) && isEven(nextItemId))
  );
};

export const mutliDragAwareReorder = (args) => {
  if (args.selecetedItemIds.length > 1) {
    return reorderMultiDrag(args);
  }
  return reorderSingleDrag(args);
};

const getHomeColumn = (entities, itemId) => {
  const columnId = entities.columnOrder.find((id) => {
    const column = entities.columns[id];
    return column.itemIds.includes(itemId);
  });

  return entities.columns[columnId];
};

const reorderMultiDrag = ({ entities, selecetedItemIds, source, destination }) => {
  const start = entities.columns[source.droppableId];
  const dragged = start.itemIds[source.index];

  const insertAtIndex = (() => {
    const destinationIndexOffset = selecetedItemIds.reduce((previous, current) => {
      if (current === dragged) {
        return previous;
      }

      const final = entities.columns[destination.droppableId];
      const column = getHomeColumn(entities, current);

      if (column !== final) {
        return previous;
      }

      const index = column.itemIds.indexOf(current);

      if (index >= destination.index) {
        return previous;
      }

      // the selected item is before the destination index
      // we need to account for this when inserting into the new location
      return previous + 1;
    }, 0);

    const result = destination.index - destinationIndexOffset;
    return result;
  })();

  // doing the ordering now as we are required to look up columns
  // and know original ordering

  const orderedSelectedItemIds = [...selecetedItemIds];

  // orderedSelectedItemIds.sort((a, b) => {
  //   // moving the dragged item to the top of the list
  //   if (a === dragged) {
  //     return -1;
  //   }
  //   if (b === dragged) {
  //     return 1;
  //   }

  //   // sorting by their natural indexes
  //   const columnForA = getHomeColumn(entities, a);
  //   const indexOfA = columnForA.itemIds.indexOf(a);
  //   const columnForB = getHomeColumn(entities, b);
  //   const indexOfB = columnForB.itemIds.indexOf(b);

  //   if (indexOfA !== indexOfB) {
  //     return indexOfA - indexOfB;
  //   }

  //   // sorting by their order in the selectedItemIds list
  //   return -1;
  // });

  // we need to remove all of the selected items from their columns
  const withRemovedItems = entities.columnOrder.reduce((previous, columnId) => {
    const column = entities.columns[columnId];

    // remove the id's of the items that are selected
    const remainingItemIds = column.itemIds.filter((id) => !selecetedItemIds.includes(id));

    previous[column.id] = withNewItemIds(column, remainingItemIds);
    return previous;
  }, entities.columns);

  const final = withRemovedItems[destination.droppableId];
  const withInserted = (() => {
    const base = [...final.itemIds];
    base.splice(insertAtIndex, 0, ...orderedSelectedItemIds);
    return base;
  })();

  // insert all selected items into final column
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
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const reorderSingleDrag = ({ entities, selecetedItemIds, source, destination }) => {
  // 같은 column안에서 이동한 경우
  if (source.droppableId === destination.droppableId) {
    const column = entities.columns[source.droppableId];
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

  const home = entities.columns[source.droppableId];
  const foreign = entities.columns[destination.droppableId];

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

export const multiSelect = (entities, selecetedItemIds, newItemId) => {
  if (!selecetedItemIds.length) {
    return [newItemId];
  }

  const columnOfNew = getHomeColumn(entities, newItemId);
  const indexOfNew = columnOfNew.itemIds.indexOf(newItemId);

  const lastSelected = selecetedItemIds[selecetedItemIds.length - 1];
  const columnOfLast = getHomeColumn(entities, lastSelected);
  const indexOfLast = columnOfLast.itemIds.indexOf(lastSelected);

  // multi selecting to another column
  // select everything up to the index of the current item
  if (columnOfNew !== columnOfLast) {
    return columnOfNew.itemIds.slice(0, indexOfNew + 1);
  }

  // multi selecting in the same column
  // need to select everything between the last index and the current index inclusive

  // nothing to do here
  if (indexOfNew === indexOfLast) {
    return null;
  }

  const isSelectingForwards = indexOfNew > indexOfLast;
  const start = isSelectingForwards ? indexOfLast : indexOfNew;
  const end = isSelectingForwards ? indexOfNew : indexOfLast;

  const inBetween = columnOfNew.itemIds.slice(start, end + 1);

  // everything inbetween needs to have it's selection toggled.
  // with the exception of the start and end values which will always be selected

  const toAdd = inBetween.filter((itemId) => {
    // if already selected: then no need to select it again
    if (selecetedItemIds.includes(itemId)) {
      return false;
    }
    return true;
  });

  const sorted = isSelectingForwards ? toAdd : [...toAdd].reverse();
  const combined = [...selecetedItemIds, ...sorted];

  return combined;
};
