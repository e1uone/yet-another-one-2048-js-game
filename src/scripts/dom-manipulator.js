export default class DOMManipulator {
  #tileContainer;
  #scoreContainer;
  #hiscoreContainer;
  #storageKey;

  score = 0;

  constructor() {
    this.#tileContainer = document.querySelector("#tiles");
    this.#scoreContainer = document.querySelector("#current-score");
    this.#hiscoreContainer = document.querySelector("#hiscore");
    this.#storageKey = "hiscore";

    this.score = 0;

    this.#updateHiscore();
  }

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

      // const preEl = document.querySelector("#debug");
      // if (preEl) {
      //   preEl.textContent = JSON.stringify(grid, null, 2);
      // }

      this.#updateScore(meta.score);
    });
  };

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

    if (tile.prevPosition) {
      // Make sure that the tile gets rendered in the previous position first
      window.requestAnimationFrame(() => {
        this.#setClass(element, classes);
        this.#setTilePosition(element, { x: tile.x, y: tile.y });
      });
    } else if (tile.mergedFrom) {
      classes.push("tile-merged");
      this.#setClass(element, classes);

      tile.mergedFrom.forEach((mergedTile) => {
        this.#addTile(mergedTile);
      });
    } else {
      classes.push("tile-new");
      this.#setClass(element, classes);
    }
  };

  #setTilePosition = (element, position) => {
    element.style.setProperty("--x-pos", position.x);
    element.style.setProperty("--y-pos", position.y);
  };

  #setTileColor = (element, bgColor, textColor) => {
    element.style.setProperty("background-color", bgColor);
    element.style.setProperty("color", textColor);
  };

  #setClass = (element, classes) => {
    element.setAttribute("class", classes.join(" "));
  };

  #getTileColor(value) {
    const colors = {
      2: "#eee4da",
      4: "#ede0c8",
      8: "#f3b27a",
      16: "#f69664",
      32: "#f77c5f",
      64: "#f75f3b",
      128: "#f2d86d",
      256: "#f2c464",
      512: "#f2a94d",
      1024: "#f2994d",
      2048: "#f2a33d",
    };

    return colors[value] || "#404";
  }

  #clearContainer = (container) => {
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
  };

  #updateScore = (score) => {
    const difference = score - this.score;

    this.score = score;

    this.#clearContainer(this.#scoreContainer);
    this.#scoreContainer.textContent = this.score.toString();

    if (difference > 0) {
      const addition = document.createElement("span");

      addition.classList.add("score-addition");
      addition.textContent = "+" + difference;

      this.#scoreContainer.appendChild(addition);

      this.#updateHiscore();
    }
  };

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
}
