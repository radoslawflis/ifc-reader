import * as OBC from 'openbim-components';
import { KeyboardKeyHold } from 'hold-event';

export const leftKey = new KeyboardKeyHold('ArrowLeft');
export const rightKey = new KeyboardKeyHold('ArrowRight');
export const upKey = new KeyboardKeyHold('ArrowUp');
export const downKey = new KeyboardKeyHold('ArrowDown');

export const addKeyboardCameraControls = (viewer: any) => {
  leftKey.addEventListener('holding', (event: any) => {
    (viewer.camera as OBC.OrthoPerspectiveCamera).controls.truck(
      -0.01 * event.deltaTime,
      0,
      false
    );
  });

  rightKey.addEventListener('holding', (event: any) => {
    (viewer.camera as OBC.OrthoPerspectiveCamera).controls.truck(
      0.01 * event.deltaTime,
      0,
      false
    );
  });

  upKey.addEventListener('holding', (event: any) => {
    (viewer.camera as OBC.OrthoPerspectiveCamera).controls.forward(
      0.01 * event.deltaTime,
      false
    );
  });

  downKey.addEventListener('holding', (event: any) => {
    (viewer.camera as OBC.OrthoPerspectiveCamera).controls.forward(
      -0.01 * event.deltaTime,
      false
    );
  });
};
