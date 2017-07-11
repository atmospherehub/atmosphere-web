import { RestApi } from './../../services/rest-api';
import { Disposable } from 'aurelia-binding/dist/aurelia-binding';
import { Subscription } from 'aurelia-event-aggregator';
import { Chart } from 'chart.js';
import { Toolbar, DatesRange } from './../../services/toolbar';
import { Mood } from "../../services/moods";

export abstract class BaseChartCustomElement<T> {
    private _data: T[];
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
        this._toolbarChanges = this._toolbar.subscribe((changeName: string) => {
            if (changeName == 'moods' && this._data != null) {
                // we don't refresh data when moods change,
                // because `this._data` has a superset of moods
                this._chart.data = this.getBindingData(this._toolbar.moods, this._data);
                this._chart.update(0);
            }
            else {
            
                this.isLoading = true;
                this._chart.data = null;
                this.getData(this._toolbar.range)
                    .then(data => {
                        this._data = data;
                        this._chart.data = this.getBindingData(this._toolbar.moods, this._data);
                        this._chart.update(0);
                        this.isLoading = false;
                    });
            }
        });

        this.getData(this._toolbar.range)
            .then(data => {
                this._data = data;
                this._chart = this.createChart(this.getBindingData(this._toolbar.moods, this._data));
                this.isLoading = false;
            });
    }

    detached() {
        this._toolbarChanges.dispose();
        this._data = null;
        if (this._chart != null)
            this._chart.destroy();
    }

    abstract getData(range: DatesRange): Promise<T[]>;

    abstract getBindingData(moods: Mood[], data: T[]): any;

    abstract createChart(bindingData: any): Chart;
}