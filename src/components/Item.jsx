import { Draggable } from 'react-beautiful-dnd';
import { GRID } from '../data/dnd';
import styled from 'styled-components';

const primaryButton = 0;

const keyCodes = {
  enter: 13,
  escape: 27,
  arrowDown: 40,
  arrowUp: 38,
  tab: 9
};

const getBackgroundColor = ({ $isDropDisabled, $isDragging, $isSelected }) => {
  if ($isDragging) {
    if ($isDropDisabled) {
      return '#FF6347';
    }
  }

  if ($isSelected) {
    return '#cde5f4';
  }

  return 'white';
};

const getColor = ({ $isGhosting }) => {
  if ($isGhosting) {
    return 'grey';
  }

  return 'black';
};

const ItemWrapper = styled.div`
  position: relative;
  background: ${(props) => getBackgroundColor(props)};
  color: ${(props) => getColor(props)};
  opacity: ${({ $isGhosting }) => ($isGhosting ? 0.8 : 1)};
  user-select: none;
  padding: ${GRID * 2}px;
  margin-bottom: ${GRID}px;
  border-radius: 8px;
  &:last-child {
    margin-bottom: 0;
  }
`;

const Count = styled.span`
  position: absolute;
  right: -10px;
  top: -10px;
  border-radius: 100%;
  height: 24px;
  width: 24px;
  font-weight: 600;
  background: darkgray;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Item = ({
  index,
  item,
  isSelected,
  isGhosting,
  selectionCount,
  toggleSelection,
  toggleSelectionInGroup,
  multiSelectTo,
  isDropDisabled
}) => {
  // 보충 작업이 필요..
  const handleKeyDown = (event, snapshot) => {
    if (event.defaultPrevented) {
      return;
    }

    // 드래그 중일 때는 키보드 이벤트 무시
    if (snapshot.isDragging) {
      return;
    }

    if (event.keyCode !== keyCodes.enter) {
      return;
    }

    event.preventDefault();
    performAction(event);
  };

  const handleClick = (event) => {
    if (event.defaultPrevented) {
      return;
    }

    // 주클릭(왼쪽 클릭)이 아니라면 리턴
    if (event.button !== primaryButton) {
      return;
    }

    event.preventDefault();
    performAction(event);
  };

  const handleTouchEnd = (event) => {
    if (event.defaultPrevented) {
      return;
    }
    event.preventDefault();
    toggleSelectionInGroup(item.id);
  };

  // ctrl키가 눌렸는지
  const wasToggleInSelectionGroupKeyUsed = (event) => {
    return navigator.userAgent.includes('Mac') ? event.metaKey : event.ctrlKey;
  };

  // shift키가 눌렸는지
  const wasMultiSelectKeyUsed = (event) => event.shiftKey;

  const performAction = (event) => {
    if (wasToggleInSelectionGroupKeyUsed(event)) {
      toggleSelectionInGroup(item.id);
      return;
    }

    if (wasMultiSelectKeyUsed(event)) {
      multiSelectTo(item.id);
      return;
    }

    toggleSelection(item.id);
  };

  return (
    <Draggable draggableId={item.id} index={index}>
      {(provided, snapshot) => (
        <ItemWrapper
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={handleClick}
          onTouchEnd={handleTouchEnd}
          onKeyDown={(event) => handleKeyDown(event, snapshot)}
          $isDragging={snapshot.isDragging}
          $isSelected={isSelected}
          $isGhosting={isGhosting}
          $isDropDisabled={isDropDisabled}>
          <span>{item.content}</span>
          {snapshot.isDragging && selectionCount > 1 ? <Count>{selectionCount}</Count> : null}
        </ItemWrapper>
      )}
    </Draggable>
  );
};

export default Item;
