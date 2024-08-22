/**
 * Class representing a tile in the 2048 game.
 *
 * @param {Object} position - tile position
 * @param {number} [value=2] - tile value
 */
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

  /**
   * Save the current position of the tile to `this.prevPosition`.
   */
  save = () => {
    this.prevPosition = { x: this.x, y: this.y };
  };

  /**
   * Update the position of the tile.
   * @param {Object} position - New position of the tile.
   */
  updatePosition = (position) => {
    this.x = position.x;
    this.y = position.y;
  };
}
