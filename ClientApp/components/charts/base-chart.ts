import { RestApi } from './../../services/rest-api';
import { EventAggregator, Subscription } from 'aurelia-event-aggregator';
import { Chart } from 'chart.js';
import { Mood } from "../../services/moods";
import { DatesRange } from "../date-range/date-range";

export abstract class BaseChartCustomElement<T> {
    abstract selectedMoods: Mood[]; // moods that currently selected 
    abstract selectedRange: DatesRange;

    private _data: T[];
    protected _element: Element;
    protected _chart: Chart;
    protected _api: RestApi;
    public isLoading: boolean;

    private _eventAggregator: EventAggregator;
    private _subscriptions: Subscription[];

    constructor(element: Element, api: RestApi, eventAggregator: EventAggregator) {
        this._element = element;
        this._api = api;
        this._eventAggregator = eventAggregator;
        this._subscriptions = [];
    }

    attached(): void {
        this.isLoading = true;
        this._subscriptions.push(this._eventAggregator.subscribe('moods_selection', message => this.selectionChanged("moods")));
        this._subscriptions.push(this._eventAggregator.subscribe('range_selection', message => this.selectionChanged("dates")));

        this.getData(this.selectedRange)
            .then(data => {
                this._data = data;
                this._chart = this.createChart(this.getBindingData(this.selectedMoods, this._data));
                this.isLoading = false;
            });
    }

    private selectionChanged(changeName: string): void {
        if (changeName == 'moods' && this._data != null) {
            // we don't refresh data when moods change,
            // because `this._data` has a superset of moods
            this._chart.data = this.getBindingData(this.selectedMoods, this._data);
            this._chart.update(0);
        }
        else {
            this.isLoading = true;
            this.getData(this.selectedRange)
                .then(data => {
                    this._data = data;
                    this._chart.data = this.getBindingData(this.selectedMoods, this._data);
                    this._chart.update(0);
                    this.isLoading = false;
                });
        }
    }

    detached(): void {
        if (this._subscriptions != null) {
            this._subscriptions.forEach(s => s.dispose());
        }
        this._data = null;
        if (this._chart != null)
            this._chart.destroy();
    }

    abstract getData(range: DatesRange): Promise<T[]>;

    abstract getBindingData(moods: Mood[], data: T[]): any;

    abstract createChart(bindingData: any): Chart;
}