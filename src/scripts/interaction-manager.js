import * as Hammer from "hammerjs";

export default class InteractionManager {
  #events = {};
  #gameContainer;
  #retryButton;
  #newGameButton;
  constructor(options) {
    this.events = {};
    this.#gameContainer = options.gameContainer;
    this.#retryButton = options.retryButton;
    this.#newGameButton = options.newGameButton;
    this.setupListeners();
  }

  setupListeners() {
    this.#bindKeyboardEvents();
    this.#bindTouchEvents();
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

  #bindTouchEvents = () => {
    const handler = new Hammer.Manager(this.#gameContainer, {
      recognizers: [
        [
          Hammer.Swipe,
          {
            direction: Hammer.DIRECTION_ALL,
          },
        ],
      ],
    });

    const gesturesMap = {
      [Hammer.DIRECTION_UP]: "up",
      [Hammer.DIRECTION_RIGHT]: "right",
      [Hammer.DIRECTION_DOWN]: "down",
      [Hammer.DIRECTION_LEFT]: "left",
    };

    handler.on("swipe", (event) => {
      event.preventDefault();

      if (Object.keys(gesturesMap).includes(event.offsetDirection.toString())) {
        this.emit("move", gesturesMap[event.offsetDirection]);
      }
    });
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
