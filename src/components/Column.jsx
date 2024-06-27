import StrictDroppable from './StrictDroppable';
import Item from './Item';
import { GRID } from '../data/dnd';
import styled from 'styled-components';

const ColumnWrapper = styled.div`
  background: ${({ $isDraggingOver }) => ($isDraggingOver ? '#8AA2C3' : 'lightgrey')};
  padding: ${GRID}px;
  width: 250px;
`;

// provided: 객체는 드롭 가능한 영역(Droppable)을 설정
// snapshot: 현재 드래그 중인 항목이 이 드롭 영역 위에 있는지를 나타내는 boolean 값
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
            // 선택된 요소인지
            const isSelected = selecetedItemIds.some(
              (selectedItemId) => selectedItemId === item.id
            );
            // 선택된 요소이나 마지막으로 선택된 요소가 아닌 경우 Ghost으로 흐리게 처리
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
