import { Draggable } from 'react-beautiful-dnd';

const Item = ({ index, item, isDropDisabled }) => {
  return (
    <Draggable draggableId={item.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={getItemStyle(snapshot.isDragging, provided.draggableProps.style, isDropDisabled)}>
          {item.content}
        </div>
      )}
    </Draggable>
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

export default Item;
