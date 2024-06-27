import { useEffect, useState } from 'react';
import { Droppable } from 'react-beautiful-dnd';

// React strictmode에서 mount를 2번씩 해서 react-beautiful-dnd 라이브러리에서 에러가 발생
// 두번째 마운트 후에 렌더링 되도록 requestAnimationFrame을 사용
const StrictDroppable = ({ children, ...props }) => {
  const [enabled, setEnabled] = useState(false);

  // 실제 화면이 갱신되어 표시되는 주기에 따라 함수를 호출해주기 때문에 자바스크립트가 프레임 시작 시 실행되도록 보장
  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));

    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);

  if (!enabled) {
    return null;
  }

  return <Droppable {...props}>{children}</Droppable>;
};

export default StrictDroppable;
