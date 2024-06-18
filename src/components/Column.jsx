import StrictDroppable from './StrictDroppable';
import Item from './Item';
import { GRID } from '../data/dnd';

const Column = ({
  column,
  items,
  selecetedItemIds,
  isDropDisabled,
  draggingId,
  toggleSelection,
  toggleSelectionInGroup,
  multiSelectTo
}) => {
  return (
    <StrictDroppable droppableId={column.id}>
      {(provided, snapshot) => (
        <div
          {...provided.droppableProps}
          ref={provided.innerRef}
          style={getListStyle(snapshot.isDraggingOver)}>
          {items.map((item, index) => {
            const isSelected = selecetedItemIds.some(
              (selectedItemId) => selectedItemId === item.id
            );
            const isGhosting = isSelected && Boolean(draggingId) && draggingId !== item.id;
            return (
              <Item
                key={item.id}
                index={index}
                item={item}
                isSelected={isSelected}
                isGhosting={isGhosting}
                selectionCount={selecetedItemIds.length}
                toggleSelection={toggleSelection}
                toggleSelectionInGroup={toggleSelectionInGroup}
                multiSelectTo={multiSelectTo}
                isDropDisabled={isDropDisabled}
              />
            );
          })}
          {provided.placeholder}
        </div>
      )}
    </StrictDroppable>
  );
};

const getListStyle = (isDraggingOver) => ({
  background: isDraggingOver ? 'lightblue' : 'lightgrey',
  padding: GRID,
  width: 250
});

export default Column;
