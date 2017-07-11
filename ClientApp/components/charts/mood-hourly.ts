import { RestApi } from './../../services/rest-api';
import { autoinject, bindable } from 'aurelia-framework';
import * as _ from 'underscore'
import { Chart } from 'chart.js';
import { BaseChartCustomElement } from './base-chart';
import { Mood } from "../../services/moods";
import { EventAggregator } from 'aurelia-event-aggregator';
import { DatesRange } from "../date-range/date-range";

@autoinject()
export class MoodHourlyCustomElement extends BaseChartCustomElement<HourlyMoods> {
    @bindable selectedMoods: Mood[];
    @bindable selectedRange: DatesRange;

    constructor(element: Element, api: RestApi, eventAggregator: EventAggregator) {
        super(element, api, eventAggregator);
    }

    getData(range: DatesRange): Promise<HourlyMoods[]> {
        return this._api.get<HourlyMoods[]>(`/charts/HourlyMoodsCounts?from=${range.start.toISOString()}&to=${range.end.toISOString()}`)
            .then(data => _.sortBy(data, h => h.Hour >= 8 && h.Hour < 12 ? h.Hour + 12 : h.Hour));
    }

    createChart(bindingData: any): Chart {
        return new Chart(this._element.getElementsByTagName('canvas')[0], {
            type: 'radar',
            data: bindingData,
            options: {
                legend: {
                    display: false
                },
                tooltips: {
                    mode: 'index'
                },
                maintainAspectRatio: false
            }
        });
    }

    getBindingData(moods: Mood[], data: HourlyMoods[]): any {
        return {
            labels: _.map(_.union(_.map(data, g => g.Hour), [12, 13, 14, 15, 16, 17, 18, 19, 8, 9, 10, 11]), g => g + ':00'),
            datasets: _.map(this.selectedMoods, mood => {
                return {
                    label: mood.name,
                    data: _.map(data, raw => raw[mood.name]),
                    backgroundColor: Chart.helpers.color(mood.color).alpha(0.1).rgbString(),
                    borderColor: mood.color
                }
            })
        };
    }
}

interface HourlyMoods {
    Hour: number;
    Anger: number;
    Contempt: number;
    Disgust: number;
    Fear: number;
    Happiness: number;
    Neutral: number;
    Sadness: number;
    Surprise: number;
}
