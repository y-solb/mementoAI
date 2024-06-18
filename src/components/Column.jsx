import StrictDroppable from './StrictDroppable';
import Item from './Item';
import { GRID } from '../data/dnd';
import styled from 'styled-components';

const ColumnWrapper = styled.div`
  background: ${({ $isDraggingOver }) => ($isDraggingOver ? '#8AA2C3' : 'lightgrey')};
  padding: ${GRID}px;
  width: 250px;
`;

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
        <ColumnWrapper
          {...provided.droppableProps}
          ref={provided.innerRef}
          $isDraggingOver={snapshot.isDraggingOver}>
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
        </ColumnWrapper>
      )}
    </StrictDroppable>
  );
};

export default Column;
