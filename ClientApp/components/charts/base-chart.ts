import { Disposable } from 'aurelia-binding/dist/aurelia-binding';
import { Subscription } from 'aurelia-event-aggregator';
import { Chart } from 'chart.js';
import { HttpClient } from 'aurelia-fetch-client';
import { Toolbar, DatesRange, Mood } from './../../services/toolbar';

export abstract class BaseChartCustomElement<T> {
    protected _toolbar: Toolbar;
    protected _element: Element;
    protected _http: HttpClient;
    protected _chart: Chart;
    protected _toolbarChanges: Subscription;

    constructor(element: Element, http: HttpClient, toolbar: Toolbar) {
        this._element = element;
        this._http = http;
        this._toolbar = toolbar;
    }

    attached() {
        this._toolbarChanges = this._toolbar.subscribe(() => {
            this.getData(this._toolbar.range)
                .then(data => {
                    this._chart.data = this.getBindingData(this._toolbar.moods, data);
                    this._chart.update(0);
                });
        });

        this.getData(this._toolbar.range)
            .then(data => this._chart = this.createChart(this.getBindingData(this._toolbar.moods, data)));
    }

    detached() {
        this._toolbarChanges.dispose();
    }

    abstract getData(range: DatesRange): Promise<T[]>;

    abstract getBindingData(moods: Mood[], data: T[]): any;

    abstract createChart(bindingData: any) : Chart;
}