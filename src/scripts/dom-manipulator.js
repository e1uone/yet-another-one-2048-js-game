import * as themes from "./themes";

/**
 * Manipulates the DOM to display the game state.
 * @property {HTMLDivElement} #tileContainer - The container for the tiles.
 * @property {HTMLDivElement} #scoreContainer - The container for the current score.
 * @property {HTMLDivElement} #hiscoreContainer - The container for the highest score.
 * @property {HTMLDivElement} #resultContainer - The container for the game result.
 * @property {string} #storageKey - The key used to store the highest score in local storage.
 * @property {number} score - The current score.
 */
export default class DOMManipulator {
  #tileContainer;
  #scoreContainer;
  #hiscoreContainer;
  #resultContainer;
  #storageKey;

  score = 0;

  constructor() {
    this.#tileContainer = document.querySelector("#tiles");
    this.#scoreContainer = document.querySelector("#current-score-container");
    this.#hiscoreContainer = document.querySelector("#hiscore");
    this.#resultContainer = document.querySelector("#result-container");
    this.#storageKey = "hiscore";

    this.score = 0;

    this.#updateHiscore();
  }

  /**
   * Updates the DOM based on the current game state.
   * @param {Grid} grid - The current game state.
   * @param {Object} meta - Additional information about the game state.
   * @param {boolean} meta.newGame - Whether the game has just started.
   * @param {boolean} meta.gameOver - Whether the game has ended.
   * @param {boolean} meta.won - Whether the game has been won.
   */
  update = (grid, meta) => {
    window.requestAnimationFrame(() => {
      this.#clearContainer(this.#tileContainer);

      grid.cells.forEach((column) => {
        column.forEach((cell) => {
          if (cell) {
            this.#addTile(cell);
          }
        });
      });

      if (meta.isGameOver) {
        this.#showGameResult(false);
      }

      if (meta.isWin) {
        this.#showGameResult(true);
      }

      this.#updateScore(meta.score);
    });
  };

  /**
   * Restarts the game.
   */
  restart = () => {
    this.#hideGameResult();
  };

  /**
   * Resets high score and restarts the game.
   */
  startNewGame = () => {
    localStorage.setItem(this.#storageKey, "0");
    this.#updateScore();
    this.#updateHiscore();
    this.#hideGameResult();
  };

  /**
   * Adds a tile to the DOM.
   *
   * @param {Tile} tile - the tile to add. The tile object contains the value of
   * the tile and its position.
   */
  #addTile = (tile) => {
    const element = document.createElement("div");

    const classes = ["tile"];

    this.#setTileColor(
      element,
      this.#getTileColor(tile.value),
      tile.value >= 8 ? "#f9f6f2" : "#776e65",
    );

    this.#setTilePosition(
      element,
      tile.prevPosition || { x: tile.x, y: tile.y },
    );
    this.#setClass(element, classes);

    element.textContent = tile.value;

    this.#tileContainer.appendChild(element);

    // If the tile has a previous position, we need to make sure that the tile gets
    // rendered in the previous position first. This is because the tile is being
    // moved, and we want to see the animation of the tile moving from its previous
    // position to its new position.
    if (tile.prevPosition) {
      window.requestAnimationFrame(() => {
        this.#setClass(element, classes);
        this.#setTilePosition(element, { x: tile.x, y: tile.y });
      });
    }
    // If the tile has been merged from other tiles, we need to add those merged
    // tiles to the DOM as well, and add the "tile-merged" CSS class to the new
    // tile.
    else if (tile.mergedFrom) {
      classes.push("tile-merged");
      this.#setClass(element, classes);

      // Here, we are adding the merged tiles to the DOM on their old positions.
      // This is done to create an animation effect where the merged tiles swipe behind the new merged tile.
      // Without this, the old tiles would simply disappear and the new merged tile would appear from nowhere.
      tile.mergedFrom.forEach((mergedTile) => {
        this.#addTile(mergedTile);
      });
    }
    // If the tile is a new tile (i.e. it has not been merged from other tiles),
    // we add the "tile-new" CSS class to the tile.
    else {
      classes.push("tile-new");
      this.#setClass(element, classes);
    }
  };

  /**
   * Sets the position of a tile element in the DOM.
   * @param {HTMLElement} element The element that needs to be positioned.
   * @param {Object} position The position of the tile, with x and y properties.
   */
  #setTilePosition = (element, position) => {
    element.style.setProperty("--x-pos", position.x);
    element.style.setProperty("--y-pos", position.y);
  };

  /**
   * Sets the background and text color of a tile element.
   * @param {HTMLElement} element The element that needs to have its color set.
   * @param {string} bgColor The background color of the tile.
   * @param {string} textColor The text color of the tile.
   */
  #setTileColor = (element, bgColor, textColor) => {
    element.style.setProperty("background-color", bgColor);
    element.style.setProperty("color", textColor);
  };

  /**
   * Sets the class of a tile element.
   * @param {HTMLElement} element The element that needs to have its class set.
   * @param {Array<string>} classes An array of class names that need to be applied to the element.
   */
  #setClass = (element, classes) => {
    element.setAttribute("class", classes.join(" "));
  };

  /**
   * Gets the color of a tile based on its value.
   * @param {number} value The value of the tile.
   * @returns {Object} An object with the backgroundColor and color.
   */
  #getTileColor(value) {
    // TODO: implement color themes

    return themes.defaultTilesTheme[value] || "#404";
  }

  /**
   * Clears all the children of a container.
   * @param {HTMLElement} container - The container whose children need to be cleared.
   */
  #clearContainer = (container) => {
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
  };

  /**
   * Updates the score display.
   * @param {number} score - The new score.
   */
  #updateScore = (score) => {
    const difference = score - this.score;

    this.score = score;

    this.#scoreContainer.querySelector(".score__value").textContent = score;

    if (difference > 0) {
      // TODO: add score difference animation

      this.#updateHiscore();
    }
  };

  /**
   * Updates the highest score display.
   */
  #updateHiscore = () => {
    const hiscore = localStorage.getItem(this.#storageKey) || "";
    const currentScore = this.score;

    if (!hiscore) {
      localStorage.setItem(this.#storageKey, currentScore.toString());
    }

    if (hiscore && currentScore > parseInt(hiscore, 10)) {
      localStorage.setItem(this.#storageKey, currentScore.toString());
    }

    this.#hiscoreContainer.textContent = localStorage.getItem(this.#storageKey);
  };

  /**
   * Shows the game result.
   *
   * @param {boolean} isWin - Indicates if the game is won.
   */
  #showGameResult = (isWin) => {
    this.#resultContainer.classList.add("game__result--show");
    this.#resultContainer.querySelector("#result-text").textContent = isWin
      ? "You won!"
      : "Game over!";
  };
  /**
   * Hides the game result.
   */
  #hideGameResult = () => {
    this.#resultContainer.classList.remove("game__result--show");
  };
}
