import { HttpClient } from 'aurelia-fetch-client';
import { inject } from 'aurelia-framework';
import * as _ from 'underscore'
import { Chart } from 'chart.js';
import * as moment from 'moment';
import { COMMON_MOODS, Mood } from '../../utils';

@inject(Element, HttpClient)
export class MoodDominantsCustomElement {
    public moods: Mood[];
    private _element: Element;

    constructor(element: Element, http: HttpClient) {
        this._element = element;
        this.moods = COMMON_MOODS;

        var endPeriod = moment().endOf('day');
        var startPeriod = moment(endPeriod).add(-30, 'days');

        http.fetch(`/api/charts/DayDominantMoodsCounts?from=${startPeriod.toISOString()}&to=${endPeriod.toISOString()}`)
            .then(result => result.json() as Promise<DayDominants[]>)
            .then(data => {
                var chart = new Chart(this._element.getElementsByTagName('canvas')[0], {
                    type: 'bar',
                    data: {
                        labels: _.map(data, g => g.DayNumber),
                        datasets: _.map(this.moods, mood => {
                            return {
                                label: mood.Name,
                                data: _.map(data, raw => raw[mood.Name]),
                                backgroundColor: mood.Color
                            }
                        })
                    },
                    options: {
                        legend: {
                            display: false
                        },
                        maintainAspectRatio: false,
                        tooltips: {
                            mode: 'index',
                            intersect: true
                        },
                        responsive: true,
                        scales: {
                            yAxes: [{
                                stacked: true,
                                ticks: {
                                    display: false
                                },
                                gridLines: {
                                    color: "rgba(0, 0, 0, 0)",
                                }
                            }],
                            xAxes: [{
                                stacked: true,
                                gridLines: {
                                    display : false,
                                }
                            }]
                        }
                    }
                });
            });
    }
}

interface DayDominants {
    DayNumber: number;
    Anger: number;
    Contempt: number;
    Disgust: number;
    Fear: number;
    Happiness: number;
    Sadness: number;
    Surprise: number;
}