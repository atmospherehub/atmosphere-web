import { DatesRange } from './../date-range/date-range';
import { ItemSelected, Mood } from './../moods-selection/moods-selection';
import { HttpClient } from 'aurelia-fetch-client';
import { inject, bindable } from 'aurelia-framework';
import * as _ from 'underscore'
import { Chart } from 'chart.js';
import * as moment from 'moment';

@inject(Element, HttpClient)
export class MoodHourlyCustomElement {
    @bindable public range: DatesRange;
    @bindable public moods: ItemSelected<Mood>[];

    private _element: Element;
    private _http: HttpClient;
    private _chart: any;

    constructor(element: Element, http: HttpClient) {
        this._element = element;
        this._http = http;
    }

    public rangeChanged(newValue: moment.Moment, oldValue: moment.Moment) {
        if(this._chart != null) this._chart.destroy();
        this._http.fetch(`/api/charts/HourlyMoodsCounts?from=${this.range.start.toISOString()}&to=${this.range.end.toISOString()}`)
            .then(result => result.json() as Promise<HourlyMoods[]>)
            .then(data => _.sortBy(data, h => h.Hour >= 8 && h.Hour < 12 ? h.Hour + 12 : h.Hour))
            .then(data => {
                this._chart = new Chart(this._element.getElementsByTagName('canvas')[0], {
                    type: 'radar',
                    data: {
                        labels: _.map(_.union(_.map(data, g => g.Hour), [12, 13, 14, 15, 16, 17, 18, 19, 8, 9, 10, 11]), g => g + ':00'),
                        datasets: _.map(this.moods, mood => {
                            return {
                                label: mood.item.name,
                                data: _.map(data, raw => raw[mood.item.name]),
                                backgroundColor: Chart.helpers.color(mood.item.color).alpha(0.1).rgbString(),
                                borderColor: mood.item.color
                            }
                        })
                    },
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
            });
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
