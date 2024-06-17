import { useState, useCallback } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import Column from './components/Column.jsx';

function App() {
  const getItems = (count) =>
    Array.from({ length: count }, (v, k) => k).map((k) => ({
      id: `item-${k}`,
      content: `item ${k}`
    }));

  const [items, setItems] = useState(getItems(10));

  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  const onDragEnd = useCallback(
    (result) => {
      if (!result.destination) {
        return;
      }

      const newItems = reorder(items, result.source.index, result.destination.index);

      setItems(newItems);
    },
    [items]
  );

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Column items={items} />
    </DragDropContext>
  );
}

export default App;
