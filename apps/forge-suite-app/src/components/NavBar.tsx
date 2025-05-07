import React from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { toggleTheme } from '../store/settingsSlice';
import { undo, redo } from '../store/undoableSlice';

export function NavBar() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector(state => state.settings.theme);
  const { past, future } = useAppSelector(state => state.undoable);

  return (
    <nav className="nav-bar">
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/geometry">Geometry</Link>
        </li>
        <li>
          <Link to="/map">Map</Link>
        </li>
        <li>
          <Link to="/mandala">Mandala</Link>
        </li>
      </ul>

      <button
        onClick={() => dispatch(undo())}
        disabled={past.length === 0}
      >Undo</button>
      <button
        onClick={() => dispatch(redo())}
        disabled={future.length === 0}
      >Redo</button>

      <button onClick={() => dispatch(toggleTheme())}>
        Toggle Theme (Current: {theme})
      </button>
    </nav>
  );
}

export default NavBar;