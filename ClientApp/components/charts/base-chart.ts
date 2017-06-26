import { RestApi } from './../../services/rest-api';
import { Disposable } from 'aurelia-binding/dist/aurelia-binding';
import { Subscription } from 'aurelia-event-aggregator';
import { Chart } from 'chart.js';
import { Toolbar, DatesRange, Mood } from './../../services/toolbar';

export abstract class BaseChartCustomElement<T> {
    protected _toolbar: Toolbar;
    protected _element: Element;
    protected _chart: Chart;
    protected _toolbarChanges: Subscription;
    protected _api: RestApi;
    public isLoading: boolean;

    constructor(element: Element, api: RestApi, toolbar: Toolbar) {
        this._element = element;
        this._api = api;
        this._toolbar = toolbar;
    }

    attached() {
        this.isLoading = true;
        this._toolbarChanges = this._toolbar.subscribe(() => {
            this.isLoading = true;
            this.getData(this._toolbar.range)
                .then(data => {
                    this._chart.data = this.getBindingData(this._toolbar.moods, data);
                    this._chart.update(0);
                    this.isLoading = false;
                });
        });

        this.getData(this._toolbar.range)
            .then(data => {
                this._chart = this.createChart(this.getBindingData(this._toolbar.moods, data));
                this.isLoading = false;
            });
    }

    detached() {
        this._toolbarChanges.dispose();
    }

    abstract getData(range: DatesRange): Promise<T[]>;

    abstract getBindingData(moods: Mood[], data: T[]): any;

    abstract createChart(bindingData: any): Chart;
}