import EventEmitter from 'events';

class ObservableMixin extends EventEmitter {

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