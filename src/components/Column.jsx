import { Draggable } from 'react-beautiful-dnd';
import StrictDroppable from './StrictDroppable';

const Column = ({ columnId, items, isDropDisabled }) => {
  return (
    <StrictDroppable droppableId={columnId}>
      {(provided, snapshot) => (
        <div
          {...provided.droppableProps}
          ref={provided.innerRef}
          style={getListStyle(snapshot.isDraggingOver)}>
          {items.map((item, index) => (
            <Draggable key={item.id} draggableId={item.id} index={index}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  style={getItemStyle(
                    snapshot.isDragging,
                    provided.draggableProps.style,
                    isDropDisabled
                  )}>
                  {item.content}
                </div>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      )}
    </StrictDroppable>
  );
};

const GRID = 8;

const getItemStyle = (isDragging, draggableStyle, isDisabledDrop) => ({
  userSelect: 'none',
  padding: GRID * 2,
  margin: `0 0 ${GRID}px 0`,
  background: isDragging ? (isDisabledDrop ? 'red' : 'lightgreen') : 'grey',
  ...draggableStyle
});

const getListStyle = (isDraggingOver) => ({
  background: isDraggingOver ? 'lightblue' : 'lightgrey',
  padding: GRID,
  width: 250
});

export default Column;
