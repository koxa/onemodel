import EventEmitter from 'events';

class ObservableMixin extends EventEmitter.EventEmitter {
  static __emitter = new EventEmitter();

  static emit(eventName, ...args) {
    this.__emitter.emit(eventName, ...args);
  }

  static on(eventName, listener) {
    this.__emitter.on(eventName, listener);
  }

  static once(eventName, listener) {
    this.__emitter.once(eventName, listener);
  }

  static removeListener(eventName, listener) {
    this.__emitter.removeListener(eventName, listener);
  }

  static off(eventName, listener) {
    this.__emitter.off(eventName, listener);
  }

  /**
   * Format: {UPDATE: 'update', ADD: 'add'}
   */
  static getEvents() {
    throw new Error('At least one event must be defined in observable class');
  }

  constructor() {
    super(...arguments);
    this.__muted = false;
  }

  mute() {
    this.__muted = true;
  }

  unMute() {
    this.__muted = false;
  }
}

export default ObservableMixin;
