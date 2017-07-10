import { RestApi } from './../../services/rest-api';
import { Toolbar, DatesRange } from './../../services/toolbar';
import { inject, bindable } from 'aurelia-framework';
import * as _ from 'underscore'
import { Chart } from 'chart.js';
import { BaseChartCustomElement } from "./base-chart";
import { Mood } from "../../services/moods";

@inject(Element, RestApi, Toolbar)
export class PeopleTogetherCustomElement extends BaseChartCustomElement<PeopleStats> {

    constructor(element: Element, api: RestApi, toolbar: Toolbar) {
        super(element, api, toolbar);
    }

    getData(range: DatesRange): Promise<PeopleStats[]> {
        return this._api.get<PeopleStats[]>(
            `/charts/PeopleOnImageCounts?from=${range.start.toISOString()}&to=${range.end.toISOString()}`);
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
