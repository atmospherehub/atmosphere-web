import { DatesRange } from './../date-range/date-range';
import { HttpClient } from 'aurelia-fetch-client';
import { inject, bindable } from 'aurelia-framework';
import * as _ from 'underscore'
import { Chart } from 'chart.js';
import * as moment from 'moment';
import { COMMON_MOODS, Mood } from '../../utils';

@inject(Element, HttpClient)
export class MoodDominantsCustomElement {
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

        this._http.fetch(`/api/charts/DominantMoodsCounts?from=${this.range.start.toISOString()}&to=${this.range.end.toISOString()}`)
            .then(result => result.json() as Promise<DayDominants[]>)
            .then(data => {
                this._chart = new Chart(this._element.getElementsByTagName('canvas')[0], {
                    type: 'bar',
                    data: {
                        labels: _.map(data, g => g.Group),
                        datasets: _.map(this.moods, mood => {
                            return {
                                label: mood.name,
                                data: _.map(data, raw => raw[mood.name]),
                                backgroundColor: mood.color
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
                                    display: false,
                                }
                            }]
                        }
                    }
                });
            });
    }
}

interface DayDominants {
    Group: number;
    Anger: number;
    Contempt: number;
    Disgust: number;
    Fear: number;
    Happiness: number;
    Sadness: number;
    Surprise: number;
}