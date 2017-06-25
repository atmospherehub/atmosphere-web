import { Toolbar, DatesRange, Mood } from './../../services/toolbar';
import { HttpClient } from 'aurelia-fetch-client';
import { inject, bindable } from 'aurelia-framework';
import * as _ from 'underscore'
import { Chart } from 'chart.js';
import { BaseChartCustomElement } from "./base-chart";

@inject(Element, HttpClient, Toolbar)
export class PeopleTogetherCustomElement extends BaseChartCustomElement<PeopleStats> {

    constructor(element: Element, http: HttpClient, toolbar: Toolbar) {
        super(element, http, toolbar);
    }

    getData(range: DatesRange): Promise<PeopleStats[]> {
        return this._http.fetch(`/api/charts/PeopleOnImageCounts?from=${range.start.toISOString()}&to=${range.end.toISOString()}`)
            .then(result => result.json() as Promise<PeopleStats[]>)
    }

    createChart(bindingData: any): Chart {
        return new Chart(this._element.getElementsByTagName('canvas')[0], {
            type: 'doughnut',
            data: bindingData,
            options: {
                legend: {
                    display: false
                },
                maintainAspectRatio: false
            }
        });
    }

    getBindingData(moods: Mood[], data: PeopleStats[]): any {
        return {
            labels: _.map(data, g => g.PeopleOnImage == 1 ? `${g.PeopleOnImage} person` : `${g.PeopleOnImage} persons`),
            datasets: [{
                data: _.map(data, g => g.Count),
                backgroundColor: ['#87CB16', '#FFA534', '#9368E9', '#00bbff']
            }]
        };
    }
}

interface PeopleStats {
    PeopleOnImage: number;
    Count: number;
}
