import { DatesRange } from './../date-range/date-range';
import { HttpClient } from 'aurelia-fetch-client';
import { inject, bindable } from 'aurelia-framework';
import * as _ from 'underscore'
import { Chart } from 'chart.js';
import * as moment from 'moment';

@inject(Element, HttpClient)
export class PeopleTogetherCustomElement {
    @bindable public range: DatesRange;

    private _element: Element;
    private _http: HttpClient;
    private _chart: any;

    constructor(element: Element, http: HttpClient) {
        this._element = element;
        this._http = http;
    }

    public rangeChanged(newValue: moment.Moment, oldValue: moment.Moment) {
        if (this._chart != null) this._chart.destroy();
        this._http.fetch(`/api/charts/PeopleOnImageCounts?from=${this.range.start.toISOString()}&to=${this.range.end.toISOString()}`)
            .then(result => result.json() as Promise<PeopleStats[]>)
            .then(data => {
                this._chart = new Chart(this._element.getElementsByTagName('canvas')[0], {
                    type: 'doughnut',
                    data: {
                        labels: _.map(data, g => g.PeopleOnImage == 1 ? `${g.PeopleOnImage} person` : `${g.PeopleOnImage} persons`),
                        datasets: [{
                            data: _.map(data, g => g.Count),
                            backgroundColor: ['#87CB16', '#FFA534', '#9368E9', '#00bbff']
                        }]
                    },
                    options: {
                        legend: {
                            display: false
                        },
                        maintainAspectRatio: false
                    }
                });
            });
    }
}

interface PeopleStats {
    PeopleOnImage: number;
    Count: number;
}
