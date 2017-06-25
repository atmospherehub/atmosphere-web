import { Disposable } from 'aurelia-binding/dist/aurelia-binding';
import { BindingEngine, inject } from 'aurelia-framework';
import { getLogger, Logger } from 'aurelia-logging';
import { EventAggregator, Subscription } from 'aurelia-event-aggregator';
import * as moment from 'moment';

@inject(BindingEngine, EventAggregator, getLogger('Toolbar'))
export class Toolbar implements Disposable {
    public moods: Mood[];
    public range: DatesRange;

    private _logger: Logger;
    private _subscriptions: Map<string, Disposable>;
    private _eventAggregator: EventAggregator;

    constructor(bindingEngine: BindingEngine, eventAggregator: EventAggregator, logger: Logger) {
        this._logger = logger;
        this._eventAggregator = eventAggregator;

        this.moods = [
            { name: 'Anger', color: 'rgb(255, 99, 132)' },
            { name: 'Contempt', color: 'rgb(54, 162, 235)' },
            { name: 'Disgust', color: 'rgb(255, 205, 86)' },
            { name: 'Fear', color: 'rgb(201, 203, 207)' },
            { name: 'Happiness', color: 'rgb(75, 192, 192)' },
            { name: 'Sadness', color: 'rgb(153, 102, 255)' },
            { name: 'Surprise', color: 'rgb(255, 159, 64)' }];
        this.range = new DatesRange(moment().startOf('month'), moment().endOf('day'));

        this._subscriptions = new Map([
            ['moods', bindingEngine
                .collectionObserver(this.moods)
                .subscribe((changes) => this._eventAggregator.publish('_toolbar', { name: 'moods', changes }))],
            ['range', bindingEngine
                .propertyObserver(this, 'range')
                .subscribe((newValue, oldValue) => this._eventAggregator.publish('_toolbar', { name: 'range', newValue, oldValue }))]
        ]);
    }

    public subscribe(delegate: (name: string, changes: any) => void) : Subscription{
        return this._eventAggregator.subscribe('_toolbar', message => delegate(message.name, message.changes));
    }

    dispose(): void {
        if (this._subscriptions != null) {
            this._subscriptions.forEach(s => s.dispose());
        }
    }
}


export interface Mood {
    name: string;
    color: string;
}

export class DatesRange {
    start: moment.Moment;
    end: moment.Moment;

    constructor(start: moment.Moment, end: moment.Moment) {
        this.start = start;
        this.end = end;
    }

    toString(): String {
        return `${this.start} - ${this.end}`;
    }
}