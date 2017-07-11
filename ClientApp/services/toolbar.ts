import { Disposable } from 'aurelia-binding/dist/aurelia-binding';
import { BindingEngine, inject } from 'aurelia-framework';
import { getLogger, Logger } from 'aurelia-logging';
import { EventAggregator, Subscription } from 'aurelia-event-aggregator';
import * as moment from 'moment';
import { MoodsService, Mood } from "./moods";

@inject(BindingEngine, EventAggregator, MoodsService, getLogger('Toolbar'))
export class Toolbar implements Disposable {
    public moods: Mood[];
    public range: DatesRange;

    private _logger: Logger;
    private _subscriptions: Map<string, Disposable>;
    private _eventAggregator: EventAggregator;

    constructor(bindingEngine: BindingEngine, eventAggregator: EventAggregator, moodsService: MoodsService, logger: Logger) {
        this._logger = logger;
        this._eventAggregator = eventAggregator;

        this.moods = moodsService.moods;
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