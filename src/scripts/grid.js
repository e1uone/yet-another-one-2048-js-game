/**
 * Grid class for 2048
 * @param {number} size - The size of the grid.
 */
export default class Grid {
  size;
  cells;

  constructor(size) {
    this.size = size;
    this.cells = [];

    this.#create();
  }

  /**
   * Creates the grid cells.
   *
   * This function initializes the `cells` property of the `Grid` class
   * with an array of arrays, where each inner array represents a row of
   * cells in the grid. Each cell is initially set to `null`.
   */
  #create = () => {
    for (let x = 0; x < this.size; x++) {
      this.cells[x] = [];
      const row = this.cells[x];

      for (let y = 0; y < this.size; y++) {
        row.push(null);
      }
    }
  };

  /**
   * Returns an array of available cells in the grid.
   * @returns An array of available cells.
   */
  #getAvailableCells = () => {
    const cells = [];

    this.iterateCells((x, y, tile) => {
      if (!tile) {
        cells.push({ x, y });
      }
    });

    return cells;
  };

  /**
   * Iterates over each cell in the grid and calls the provided callback function.
   *
   * @param {function} callback - The callback function to be called for each cell.
   *                             The callback function receives the `x` and `y`
   *                             coordinates of the cell, and the content of the cell.
   */
  iterateCells = (callback) => {
    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        callback(x, y, this.cells[x][y]);
      }
    }
  };

  /**
   * Checks if the given position is within the bounds of the grid.
   *
   * @param {Object} position - The position to check.
   *                           The position object should have `x` and `y`
   *                           properties representing the coordinates.
   * @return {boolean}
   */
  isInBounds = (position) => {
    return (
      position.x >= 0 &&
      position.x < this.size &&
      position.y >= 0 &&
      position.y < this.size
    );
  };

  /**
   * Returns the content of the cell at the given position.
   *
   * If the position is out of bounds, it returns `null`.
   *
   * @param cell The cell to get the content of.
   * @return The content of the cell.
   */
  getCellContent = (cell) =>
    this.isInBounds(cell) ? this.cells[cell.x][cell.y] : null;

  /**
   * Returns a random available cell in the grid.
   *
   * If there are no available cells, it returns `null`.
   *
   * @returns A random available cell.
   */
  getAvailableCell = () => {
    const cells = this.#getAvailableCells();

    if (!cells.length) {
      return null;
    }

    return cells[Math.floor(Math.random() * cells.length)];
  };

  /**
   * Checks if there are available cells in the grid.
   *
   * @returns {boolean} `true` if there are available cells, `false` otherwise.
   */
  hasCellsAvailable = () => !!this.#getAvailableCells().length;

  /**
   * Checks if the cell at the given position is occupied.
   *
   * @param {Object} cell - The position of the cell to check.
   *                       The cell object should have `x` and `y`
   *                       properties representing the coordinates.
   * @return {boolean}
   */
  isCellOccupied = (cell) => !!this.getCellContent(cell);

  /**
   * Checks if a cell is available.
   *
   * A cell is considered available if it is within the grid boundaries and
   * does not contain a tile.
   *
   * @param {Object} cell - The cell to check.
   *                        The cell object contains `x` and `y` coordinates.
   *
   * @returns {boolean}
   */
  isCellAvailable = (cell) => !this.isCellOccupied(cell);

  /**
   * Inserts a tile into the grid.
   *
   * @param {Object} tile - The tile to insert.
   *                        The tile object should have `x` and `y`
   *                        properties representing the coordinates.
   */
  insertTile = (tile) => {
    this.cells[tile.x][tile.y] = tile;
  };

  /**
   * Removes a tile from the grid.
   *
   * @param {Object} tile - The tile to remove.
   *                        The tile object should have `x` and `y`
   *                        properties representing the coordinates.
   */
  removeTile = (tile) => {
    this.cells[tile.x][tile.y] = null;
  };
}
