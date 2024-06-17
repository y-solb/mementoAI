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
  const [entities, setEntities] = useState(initialData);

  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  const onDragEnd = useCallback(
    (result) => {
      const { source, destination } = result;

      if (!destination) {
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
    <DragDropContext onDragEnd={onDragEnd}>
      <div style={{ display: 'flex', gap: '20px' }}>
        {entities.columnOrder.map((columnId) => (
          <Column key={columnId} columnId={columnId} items={entities.columns[columnId]} />
        ))}
      </div>
    </DragDropContext>
  );
}

export default App;
