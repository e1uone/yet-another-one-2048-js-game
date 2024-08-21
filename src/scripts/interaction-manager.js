export default class InteractionManager {
  #events = {};
  constructor() {
    this.events = {};

    this.setupListeners();
  }

  setupListeners() {
    this.#bindKeyboardEvents();
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
}
