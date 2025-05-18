import { useEffect, useRef } from 'preact/hooks';
import { Game } from './gamelogic/Game';

// maybe i should consider updating q5 to break it up
export function App() {
  const parentRef = useRef(null);
  // do i even need a ref? or is this taking up the whole screen?
  useEffect(() => {
    // console.log('useEffect');
    if (!parentRef.current) return;
    new Game(parentRef.current);

    // Dispose game?
  }, []);

  // TODO: create instance of Q5Xts
  // TODO: Allow importing of assets?
  // TODO: Create sprites from bitmaps instead?
  // TODO: Move item by click on screen
  // TODO: Item should move towards point on screen

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
      }}
      ref={parentRef}
    ></div>
  );
}
