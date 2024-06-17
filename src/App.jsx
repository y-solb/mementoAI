import { useState, useCallback } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import Column from './components/Column';

const getItems = (count, offset = 0) =>
  Array.from({ length: count }, (v, k) => k).map((k) => ({
    id: `item-${k + offset}`,
    content: `item ${k + offset}`
  }));

const initialData = {
  columnOrder: ['column-1', 'column-2', 'column-3', 'column-4'],
  columns: {
    'column-1': getItems(10),
    'column-2': getItems(10, 10),
    'column-3': getItems(10, 20),
    'column-4': getItems(10, 30)
  }
};

function App() {
  const [isDropDisabled, setIsDropDisabled] = useState(false);
  const [entities, setEntities] = useState(initialData);

  const onDragStart = useCallback(() => {
    setIsDropDisabled(false);
  }, []);

  const onDragUpdate = useCallback(
    (update) => {
      const { destination, source, draggableId } = update;
      if (!destination) return;

      const nextItem = entities.columns[destination.droppableId][destination.index];
      if (
        (source.droppableId === 'column-1' && destination.droppableId === 'column-3') ||
        (nextItem && isEven(draggableId) && isEven(nextItem.id))
      ) {
        setIsDropDisabled(true);
        return;
      }

      setIsDropDisabled(false);
    },
    [entities.columns]
  );

  const onDragEnd = useCallback(
    (result) => {
      const { source, destination, draggableId } = result;
      if (!destination) return;

      // 첫 번째 칼럼에서 세 번째 칼럼으로는 아이템 이동이 불가능해야 합니다.
      if (source.droppableId === 'column-1' && destination.droppableId === 'column-3') {
        return;
      }

      // 짝수 아이템은 다른 짝수 아이템 앞으로 이동할 수 없습니다.
      const nextItem = entities.columns[destination.droppableId][destination.index];
      if (nextItem && isEven(draggableId) && isEven(nextItem.id)) {
        return;
      }

      if (source.droppableId === destination.droppableId) {
        const column = entities.columns[source.droppableId];
        const newItems = reorder(column, source.index, destination.index);

        setEntities({
          ...entities,
          columns: { ...entities.columns, [source.droppableId]: newItems }
        });
      } else {
        const sourceColumn = entities.columns[source.droppableId];
        const destColumn = entities.columns[destination.droppableId];

        const [removed] = sourceColumn.splice(source.index, 1);
        destColumn.splice(destination.index, 0, removed);

        setEntities({
          ...entities,
          columns: {
            ...entities.columns,
            [source.droppableId]: sourceColumn,
            [destination.droppableId]: destColumn
          }
        });
      }
    },
    [entities]
  );

  return (
    <DragDropContext onDragUpdate={onDragUpdate} onDragEnd={onDragEnd} onDragStart={onDragStart}>
      <div style={{ display: 'flex', gap: '20px' }}>
        {entities.columnOrder.map((columnId) => (
          <Column
            key={columnId}
            columnId={columnId}
            items={entities.columns[columnId]}
            isDropDisabled={isDropDisabled}
          />
        ))}
      </div>
    </DragDropContext>
  );
}

const isEven = (str) => {
  return Number(str.replace('item-', '')) % 2 === 0;
};

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

export default App;
