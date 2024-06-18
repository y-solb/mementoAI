const items = Array.from({ length: 20 }, (v, k) => k).map((k) => ({
  id: `item-${k}`,
  content: `item ${k}`
}));

const itemMap = items.reduce((previous, current) => {
  previous[current.id] = current;
  return previous;
}, {});

const column1 = {
  id: 'column-1',
  title: 'column 1',
  itemIds: items.map((item) => item.id)
};

const column2 = {
  id: 'column-2',
  title: 'column 2',
  itemIds: []
};

const column3 = {
  id: 'column-3',
  title: 'column 3',
  itemIds: []
};

const column4 = {
  id: 'column-4',
  title: 'column 4',
  itemIds: []
};

export const initialData = {
  columnOrder: [column1.id, column2.id, column3.id, column4.id],
  columns: {
    [column1.id]: column1,
    [column2.id]: column2,
    [column3.id]: column3,
    [column4.id]: column4
  },
  items: itemMap
};

export const GRID = 8;
