import { Draggable } from 'react-beautiful-dnd';
import { GRID } from '../data/dnd';

const primaryButton = 0;

const keyCodes = {
  enter: 13,
  escape: 27,
  arrowDown: 40,
  arrowUp: 38,
  tab: 9
};

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
  const handleKeyDown = (event, snapshot) => {
    if (event.defaultPrevented) {
      return;
    }

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

  const wasToggleInSelectionGroupKeyUsed = (event) => {
    return navigator.userAgent.includes('Mac') ? event.metaKey : event.ctrlKey;
  };

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
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={getItemStyle(
            snapshot.isDragging,
            provided.draggableProps.style,
            isSelected,
            isGhosting,
            isDropDisabled
          )}
          onClick={handleClick}
          onTouchEnd={handleTouchEnd}
          onKeyDown={(event) => handleKeyDown(event, snapshot)}>
          {item.content}
          {snapshot.isDragging && selectionCount > 1 ? <span>{selectionCount}</span> : null}
        </div>
      )}
    </Draggable>
  );
};

const getItemStyle = (isDragging, draggableStyle, isSelected, isGhosting, isDropDisabled) => ({
  background: isDragging ? (isDropDisabled ? 'red' : 'lightgreen') : 'grey',
  color: isGhosting ? 'darkgrey' : isSelected ? 'green' : 'pink',
  userSelect: 'none',
  padding: GRID * 2,
  margin: `0 0 ${GRID}px 0`,
  ...draggableStyle
});

export default Item;
