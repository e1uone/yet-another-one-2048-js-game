export default class InteractionManager {
  #events = {};
  #retryButton;
  #newGameButton;
  constructor(options) {
    this.events = {};
    this.#retryButton = options.retryButton;
    this.#newGameButton = options.newGameButton;
    this.setupListeners();
  }

  setupListeners() {
    this.#bindKeyboardEvents();
    this.#bindRestart();
    this.#bindStartNewGame();
  }

  on = (event, callback) => {
    if (!this.#events[event]) {
      this.#events[event] = [];
    }
    this.#events[event].push(callback);
  };

  emit = (event, data) => {
    const callbacks = this.#events[event];

    if (!callbacks) {
      return;
    }

    callbacks.forEach((callback) => callback(data));
  };

  #restart = () => {
    this.emit("restart");
  };
  #startNewGame = () => {
    this.emit("startNewGame");
  };

  #bindKeyboardEvents = () => {
    document.addEventListener("keydown", (event) => {
      switch (event.key) {
        case "ArrowUp":
          this.emit("move", "up");
          break;
        case "ArrowDown":
          this.emit("move", "down");
          break;
        case "ArrowLeft":
          this.emit("move", "left");
          break;
        case "ArrowRight":
          this.emit("move", "right");
          break;
        default:
          break;
      }
    });
  };

  #bindRestart = () => {
    this.#retryButton.addEventListener("click", this.#restart.bind(this));
  };

  #bindStartNewGame = () => {
    this.#newGameButton.addEventListener(
      "click",
      this.#startNewGame.bind(this),
    );
  };
}
