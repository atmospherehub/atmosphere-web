import { DatesRange } from './../date-range/date-range';
import { HttpClient } from 'aurelia-fetch-client';
import { inject, bindable } from 'aurelia-framework';
import * as _ from 'underscore'
import { Chart } from 'chart.js';
import * as moment from 'moment';
import { COMMON_MOODS, Mood } from '../../utils';

@inject(Element, HttpClient)
export class MoodHourlyCustomElement {
    public moods: Mood[];
    @bindable public range: DatesRange;

    private _element: Element;
    private _http: HttpClient;
    private _chart: any;

    constructor(element: Element, http: HttpClient) {
        this._element = element;
        this._http = http;
        this.moods = COMMON_MOODS;
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
                        labels: _.map(data, g => g.Hour + ':00'),
                        datasets: _.map(this.moods, mood => {
                            return {
                                label: mood.name,
                                data: _.map(data, raw => raw[mood.name]),
                                backgroundColor: Chart.helpers.color(mood.color).alpha(0.1).rgbString(),
                                borderColor: mood.color
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
