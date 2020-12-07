export const getContainerVisibility = (container: Element): number => {
  const { top, height } = container.getBoundingClientRect();

  const current = window.innerHeight - top;
  const max = window.innerHeight + height;
  return current / max;
};

// TODO: define the return value in 'types.ts'
export const getContainerCursorPosition = (
  container: Element,
  cursorX: number,
  cursorY: number,
): { x: number; y: number } => {
  const { top, left, width, height } = container.getBoundingClientRect();

  const x = (cursorX - left) / width;
  const y = (cursorY - top) / height;

  return { x, y };
};
