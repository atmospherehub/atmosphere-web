import { HttpClient } from 'aurelia-fetch-client';
import { inject } from 'aurelia-framework';
import * as _ from 'underscore'
import { Chart } from 'chart.js';
import * as moment from 'moment';

@inject(Element, HttpClient)
export class PeopleTogetherCustomElement {
    private _element: Element;

    constructor(element: Element, http: HttpClient) {
        this._element = element;

        var endPeriod = moment().endOf('day');
        var startPeriod = moment(endPeriod).add(-30, 'days');

        http.fetch(`/api/charts/PeopleOnImageCounts?from=${startPeriod.toISOString()}&to=${endPeriod.toISOString()}`)
            .then(result => result.json() as Promise<PeopleStats[]>)
            .then(data => {
                var chart = new Chart(this._element.getElementsByTagName('canvas')[0], {
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
