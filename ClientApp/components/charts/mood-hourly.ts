import { HttpClient } from 'aurelia-fetch-client';
import { inject } from 'aurelia-framework';
import * as _ from 'underscore'
import { Chart } from 'chart.js';
import * as moment from 'moment';
import { COMMON_MOODS, Mood } from '../../utils';

@inject(Element, HttpClient)
export class MoodHourlyCustomElement {
    public moods: Mood[];
    private _element: Element;

    constructor(element: Element, http: HttpClient) {
        this._element = element;
        this.moods = COMMON_MOODS;

        var endPeriod = moment().endOf('day');  
        var startPeriod = moment(endPeriod).add(-30, 'days');

        http.fetch(`/api/charts/HourlyMoodsCounts?from=${startPeriod.toISOString()}&to=${endPeriod.toISOString()}`)
            .then(result => result.json() as Promise<HourlyMoods[]>)
            .then(data => _.sortBy(data, h => h.Hour >= 8 && h.Hour < 12 ? h.Hour + 12 : h.Hour))
            .then(data => {
                var chart = new Chart(this._element.getElementsByTagName('canvas')[0], {
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
