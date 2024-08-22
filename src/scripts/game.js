import Grid from "./grid";
import DOMManipulator from "./dom-manipulator";
import Tile from "./tile";
import InteractionManager from "./interaction-manager";

export default class Game {
  #size;
  #score = 0;
  #startTiles;
  #isGameOver = false;
  #isWin = false;
  #grid = null;
  #domManipulator = null;
  #interactionManager = null;

  constructor(size, startTiles = 2) {
    this.#size = size;
    this.#startTiles = startTiles;

    this.#domManipulator = new DOMManipulator();

    this.#interactionManager = new InteractionManager({
      retryButton: document.querySelector("#retry-button"),
      gameContainer: document.querySelector("#game-container"),
      newGameButton: document.querySelector("#new-game-button"),
    });

    this.#interactionManager.on("move", this.#move);
    this.#interactionManager.on("restart", this.#restart);
    this.#interactionManager.on("startNewGame", this.#startNewGame);

    this.#initialize();
  }

  #initialize = () => {
    this.#grid = new Grid(this.#size);

    this.#score = 0;
    this.#isGameOver = false;
    this.#isWin = false;

    this.#renderStartTiles();
    this.#updateView();
  };

  #restart = () => {
    this.#domManipulator.restart();
    this.#initialize();
  };

  #startNewGame = () => {
    this.#domManipulator.startNewGame();
    this.#initialize();
  };

  #renderStartTiles = () => {
    for (let i = 0; i < this.#startTiles; i++) {
      this.#addRandomTile();
    }
  };

  #addRandomTile = () => {
    if (!this.#grid || !this.#grid.hasCellsAvailable()) {
      return;
    }

    const value = Math.random() < 0.75 ? 2 : 4;

    const availableCell = this.#grid.getAvailableCell();

    const tile = new Tile(availableCell, value);

    this.#grid.insertTile(tile);
  };

  #updateView = () => {
    if (!this.#grid) {
      return;
    }

    this.#domManipulator.update(this.#grid, {
      score: this.#score,
      isGameOver: this.#isGameOver,
      isWin: this.#isWin,
    });

    const preEl = document.querySelector("#debug");
    if (preEl) {
      // preEl.textContent = JSON.stringify(this.#isGameOver, null, 2);
    }
  };

  #prepareTilesForMerge = () => {
    if (!this.#grid) {
      return;
    }

    this.#grid.iterateCells((x, y, tile) => {
      if (tile) {
        tile.mergedFrom = null;
        tile.save();
      }
    });
  };
  // Get vectors by direction
  #getCoordinatesVector = (direction) => {
    const map = {
      up: { x: 0, y: -1 },
      right: { x: 1, y: 0 },
      down: { x: 0, y: 1 },
      left: { x: -1, y: 0 },
    };

    return map[direction];
  };

  /**
   * Build a list of positions to traverse in the right order
   *
   * @param {Object} coordinatesVector - The vector representing the direction of movement
   * @param {number} coordinatesVector.x
   * @param {number} coordinatesVector.y
   *
   * @return {Object} - An object containing the traversals for x and y

   */
  #buildTraversals = (coordinatesVector) => {
    const traversals = { x: [], y: [] };

    for (let pos = 0; pos < this.#size; pos++) {
      traversals.x.push(pos);
      traversals.y.push(pos);
    }

    // Always traverse from the farthest cell in the chosen direction :)
    if (coordinatesVector.x === 1) {
      traversals.x = traversals.x.reverse();
    }
    if (coordinatesVector.y === 1) {
      traversals.y = traversals.y.reverse();
    }

    return traversals;
  };

  /**
   * Find the farthest position to which a tile can be moved in the given direction.
   *
   * @param {Object} cell
   * @param {Object} coordinatesVector
   * @return {Object}
   */
  #findFarthestPosition = (cell, coordinatesVector) => {
    let previousPosition;

    // Progress towards the vector direction until an obstacle is found
    do {
      previousPosition = cell;
      cell = {
        x: previousPosition.x + coordinatesVector.x,
        y: previousPosition.y + coordinatesVector.y,
      };
    } while (this.#grid.isInBounds(cell) && this.#grid.isCellAvailable(cell));

    return {
      farthestPosition: previousPosition,
      nextPosition: cell, // Used to check if a merge is required
    };
  };

  /**
   * Check if two positions are equal.
   *
   * @param {Position} first
   * @param {Position} second
   * @return {boolean}
   */
  #checkPositionsEqual = function (first, second) {
    return first.x === second.x && first.y === second.y;
  };

  /**
   * Slide the tile to the specified cell position.
   *
   * @param {Tile} tile
   * @param {Position} cell
   */
  #slideTile = (tile, cell) => {
    this.#grid.cells[tile.x][tile.y] = null;
    this.#grid.cells[cell.x][cell.y] = tile;
    tile.updatePosition(cell);
  };

  /**
   * Check if there are any two adjacent tiles with the same value that can be merged.
   * @returns {boolean}
   */
  #tileMatchesAvailable = () => {
    let tile;

    for (let x = 0; x < this.#size; x++) {
      for (let y = 0; y < this.#size; y++) {
        tile = this.#grid.getCellContent({ x, y });

        if (!tile) {
          continue;
        }

        for (let direction of ["up", "right", "down", "left"]) {
          const coordinatesVector = this.#getCoordinatesVector(direction);
          const cell = {
            x: x + coordinatesVector.x,
            y: y + coordinatesVector.y,
          };

          const other = this.#grid.getCellContent(cell);

          if (other && other.value === tile.value) {
            return true;
          }
        }
      }
    }

    return false;
  };

  /**
   * Check if there are any moves left. A move is available if there are at least two adjacent tiles with the same value or if there is an empty cell.
   * @returns {boolean}
   */
  #hasMovesLeft = () =>
    this.#grid.hasCellsAvailable() || this.#tileMatchesAvailable();

  /**
   * Move all tiles in the given direction.
   * @param {number} direction Direction to move tiles in. (possible values are 'left', 'right', 'up', 'down')
   */
  #move = (direction) => {
    if (this.#isGameOver || this.#isWin) {
      return;
    }

    let cell;
    let tile;
    let isMoved = false;

    const coordinatesVector = this.#getCoordinatesVector(direction);
    const traversals = this.#buildTraversals(coordinatesVector);

    this.#prepareTilesForMerge();

    /**
     *  The following block of code is responsible for moving and merging tiles in the game board.
        - It iterates over each cell in the game grid and checks if there is a tile present in that cell.
        - If there is a tile, it determines the farthest position the tile can be moved to in the given direction.
        - If the farthest position is different from the current cell, it moves the tile to the farthest position.
        - If two tiles with the same value are adjacent after the move, they are merged into a single tile with double the value.
        - The process continues until no more tiles can be moved or merged.
    */
    traversals.x.forEach((x) => {
      traversals.y.forEach((y) => {
        cell = { x: x, y: y };
        tile = this.#grid.getCellContent(cell);

        if (tile) {
          const { farthestPosition, nextPosition } = this.#findFarthestPosition(
            cell,
            coordinatesVector,
          );

          const nextCellContent = this.#grid.getCellContent(nextPosition);

          // Only one merge per row traversal
          if (
            nextCellContent &&
            nextCellContent.value === tile.value &&
            !nextCellContent.mergedFrom
          ) {
            let mergedTile = new Tile(nextPosition, tile.value * 2);
            mergedTile.mergedFrom = [tile, nextCellContent];

            this.#grid.insertTile(mergedTile);
            this.#grid.removeTile(tile);

            // Converge the two tiles' positions
            tile.updatePosition(nextPosition);

            // Update the score
            this.#score += mergedTile.value;

            // The mighty 2048 tile
            if (mergedTile.value === 2048) {
              this.won = true;
            }
          } else {
            this.#slideTile(tile, farthestPosition);
          }

          if (!this.#checkPositionsEqual(cell, tile)) {
            // Determine if one of the tile positions changed!
            isMoved = true;
          }
        }
      });
    });

    // Do some stuff if the move was made
    if (isMoved) {
      this.#addRandomTile();

      if (!this.#hasMovesLeft()) {
        this.#isGameOver = true; // GG WP!
      }

      this.#updateView();
    }
  };
}
