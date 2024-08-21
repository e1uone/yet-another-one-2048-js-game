export default class Tile {
  tileElement;
  x;
  y;
  value;
  mergedFrom;
  prevPosition;

  constructor(position, value) {
    this.x = position.x;
    this.y = position.y;
    this.value = value || 2;
    this.mergedFrom = null;
    this.prevPosition = null;
  }

  save = () => {
    this.prevPosition = { x: this.x, y: this.y };
  };

  updatePosition = (position) => {
    this.x = position.x;
    this.y = position.y;
  };
}
