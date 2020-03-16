// represent the following API, in other words implement the Events function/class

// scaffold
class Event {
    constructor(data, eventsByTopic) {
        this.data = data;
        this.eventsByTopic = eventsByTopic;
    }

    remove() {
        this.eventsByTopic.splice(this.eventsByTopic.indexOf(this), 1);
    }
}

class Events {
    constructor() {
        // this.events = {
        //     'topic': [{fn: fn, called: true/false}]
        // }
        this.events = {};
    }

    publish(topic, payload) {
        if (this.events[topic]) {
            for(let obj of this.events[topic]) {
                if (!obj.data.once) {
                    if (obj.data.fn instanceof Promise) {

                    }
                    obj.data.fn(payload);
                    obj.data.called = true;
                } else if (obj.data.once && obj.data.called === false) {
                    obj.data.fn(payload);
                    obj.data.called = true;
                }
            }
        }
    }

    // returns {remove}
    subscribe(topic, callback) {
        if(!this.events[topic]) {
            this.events[topic] = [];
        }
        const ev = new Event({fn: callback, called: false, once: false}, this.events[topic]);
        this.events[topic].push(ev);
        return ev;
    }

    publishAll(payload) {
        for (let prop in this.events) {
            this.publish(prop, payload);
        }
    }

    subscribeOnce(topic, callback) {
        if(!this.events[topic]) {
            this.events[topic] = [];
        }
        const ev = new Event({fn: callback, called: false, once: true}, this.events[topic]);
        this.events[topic].push(ev);
        return ev;
    }

    // returns a Promise
    async subscribeOnceAsync(topic) {
        if(!this.events[topic]) {
            this.events[topic] = [];
        }
        const ev = new Event({fn: callback, called: false, once: true, resolve: resolve}, this.events[topic]);
        this.events[topic].push(ev);
        return new Promise((resolve, reject) => {
            resolve()
        });
    }
}

const events = new Events();

const topicSubscription = events.subscribe('topic', function(payload) { console.log(`this topic has been triggered with ${payload}`)});

events.publish('topic', 'this information');
// result:
// this topic has been triggered with this information

const otherTopicSubscription = events.subscribe('topic', function(payload) { console.log(`I have been also summoned with ${payload}`)});

events.publish('topic', 'this information now');
// result:
// this topic has been triggered with this information now
// I have been also summoned with this information now

topicSubscription.remove();

events.publish('topic', 'another call with this info');
// result:
// I have been also summoned with another call with this info
//
const anotherTopicSubscription = events.subscribe('AnotherTopic', function(payload) { console.log(`new topic, new life with ${payload}`)});
//
events.publish('AnotherTopic', 'so much to publish!');
// // result:
// // new topic, new life with so much to publish!
//
events.publishAll('every topic deserves to know!');
//
// // result:
// // I have been also summoned with every topic deserves to know!
// // new topic, new life with every topic deserves to know!
//
events.subscribeOnce('topic', function(payload) {console.log(`this will only execute once with ${payload}`)});
//
events.publish('topic', 'more stuff!');
// // result:
// // I have been also summoned with more stuff!
// // this will execute only once with more stuff!
//
//
events.publish('topic', 'more stuff!');
// // result:
// // I have been also summoned with more stuff!
//
//
events.subscribeOnceAsync('topic').then(function(payload) { console.log(`this will execute only once with ${payload}` )});
//
events.publish('topic', 'more stuff!');
// // result:
// // I have been also summoned with more stuff!
// // this will execute only once with more stuff!
//
//
// events.publish('topic', 'more stuff again!');
// // result:
// // I have been also summoned with more stuff again!