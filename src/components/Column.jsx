import StrictDroppable from './StrictDroppable';
import Item from './Item';

const Column = ({ columnId, items, isDropDisabled }) => {
  return (
    <StrictDroppable droppableId={columnId}>
      {(provided, snapshot) => (
        <div
          {...provided.droppableProps}
          ref={provided.innerRef}
          style={getListStyle(snapshot.isDraggingOver)}>
          {items.map((item, index) => (
            <Item key={item.id} index={index} item={item} isDropDisabled={isDropDisabled} />
          ))}
          {provided.placeholder}
        </div>
      )}
    </StrictDroppable>
  );
};

const GRID = 8;

const getListStyle = (isDraggingOver) => ({
  background: isDraggingOver ? 'lightblue' : 'lightgrey',
  padding: GRID,
  width: 250
});

export default Column;
