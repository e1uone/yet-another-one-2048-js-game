import * as Hammer from "hammerjs";

/**
 * The interaction manager is responsible for binding events to the game container and retry button.
 *
 * @param {Object} options The options object with the following properties:
 *                          - `gameContainer`: The game container element.
 *                          - `retryButton`: The retry button element.
 *                          - `retryButton`: The new game button element.
 */
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

  /**
   * Sets up all the event listeners for the game interactions.
   */
  setupListeners() {
    this.#bindKeyboardEvents();
    this.#bindTouchEvents();
    this.#bindRestart();
    this.#bindStartNewGame();
  }

  /**
   * Registers a callback function to be called when the specified event is emitted.
   *
   * @param {string} event - The name of the event to listen for.
   * @param {Function} callback - The function to be called when the event is emitted.
   */
  on = (event, callback) => {
    if (!this.#events[event]) {
      this.#events[event] = [];
    }
    this.#events[event].push(callback);
  };

  /**
   * Emits an event to all registered listeners.
   *
   * @param {string} event - The name of the event to emit.
   * @param {*} data - The data to be passed to the registered listeners.
   */
  emit = (event, data) => {
    const callbacks = this.#events[event];

    if (!callbacks) {
      return;
    }

    callbacks.forEach((callback) => callback(data));
  };

  /**
   * Binds touch events to the game container.
   */
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
      event.srcEvent.stopPropagation();
      event.preventDefault();

      if (Object.keys(gesturesMap).includes(event.offsetDirection.toString())) {
        this.emit("move", gesturesMap[event.offsetDirection]);
      }
    });
  };

  /**
   * Emits a "restart" event.
   */
  #restart = () => {
    this.emit("restart");
  };

  /**
   * Emits a "startNewGame" event.
   */
  #startNewGame = () => {
    this.emit("startNewGame");
  };

  /**
   * Binds keyboard event listeners.
   *
   * This method sets up event listeners for the arrow keys
   * When the user presses an arrow key, it emits a "move" event with the
   * direction of the arrow key.
   */
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

  /**
   * Binds the click event listener to the retry button.
   *
   * When the retry button is clicked, it emits a "restart" event.
   */
  #bindRestart = () => {
    this.#retryButton.addEventListener("click", this.#restart.bind(this));
  };

  /**
   * Binds the click event listener to the new game button.
   *
   * When the new game button is clicked, it emits a "startNewGame" event.
   */
  #bindStartNewGame = () => {
    this.#newGameButton.addEventListener(
      "click",
      this.#startNewGame.bind(this),
    );
  };
}
