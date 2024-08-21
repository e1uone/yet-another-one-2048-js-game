export default class Grid {
  size;
  cells;

  constructor(size) {
    this.size = size;
    this.cells = [];

    this.#create();
  }

  #create = () => {
    for (let x = 0; x < this.size; x++) {
      this.cells[x] = [];
      const row = this.cells[x];

      for (let y = 0; y < this.size; y++) {
        row.push(null);
      }
    }
  };

  #getAvailableCells = () => {
    const cells = [];

    this.iterateCells((x, y, tile) => {
      if (!tile) {
        cells.push({ x, y });
      }
    });

    return cells;
  };

  getCellContent = (cell) =>
    this.isInBounds(cell) ? this.cells[cell.x][cell.y] : null;

  getAvailableCell = () => {
    const cells = this.#getAvailableCells();

    if (!cells.length) {
      return null;
    }

    return cells[Math.floor(Math.random() * cells.length)];
  };

  iterateCells = (callback) => {
    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        callback(x, y, this.cells[x][y]);
      }
    }
  };

  hasCellsAvailable = () => !!this.#getAvailableCells().length;

  isCellAvailable = (cell) => !this.isCellOccupied(cell);

  isInBounds = (position) => {
    return (
      position.x >= 0 &&
      position.x < this.size &&
      position.y >= 0 &&
      position.y < this.size
    );
  };

  insertTile = (tile) => {
    this.cells[tile.x][tile.y] = tile;
  };

  removeTile = (tile) => {
    this.cells[tile.x][tile.y] = null;
  };

  isCellOccupied = (cell) => !!this.getCellContent(cell);
}
