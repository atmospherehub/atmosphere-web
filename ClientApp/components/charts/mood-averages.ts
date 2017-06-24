import { DatesRange } from './../date-range/date-range';
import { HttpClient } from 'aurelia-fetch-client';
import { bindable, inject } from 'aurelia-framework';
import * as _ from 'underscore'
import { Chart } from 'chart.js';
import * as moment from 'moment';
import { COMMON_MOODS, Mood } from '../../utils';

@inject(Element, HttpClient)
export class MoodAveragesCustomElement {
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
        this._http.fetch(`/api/charts/DayMoodsAverages?from=${this.range.start.toISOString()}&to=${this.range.end.toISOString()}`)
            .then(result => result.json() as Promise<DayAverages[]>)
            .then(data => {
                this._chart = new Chart(this._element.getElementsByTagName('canvas')[0], {
                    type: 'line',
                    data: {
                        labels: _.map(data, g => g.DayNumber),
                        datasets: _.map(this.moods, mood => {
                            return {
                                label: mood.name,
                                data: _.map(data, raw => raw['Avg' + mood.name]),
                                backgroundColor: Chart.helpers.color(mood.color).alpha(0.1).rgbString(),
                                borderColor: mood.color
                            }
                        })
                    },
                    options: {
                        legend: {
                            display: false
                        },
                        maintainAspectRatio: false,
                        elements: {
                            line: {
                                tension: 0.01,
                                borderWidth: 2,
                            },
                            point: {
                                radius: 3
                            }
                        },
                        tooltips: {
                            enabled: false
                        },
                        scales: {
                            yAxes: [{
                                ticks: {
                                    display: false
                                },
                                gridLines: {
                                    color: "rgba(0, 0, 0, 0)",
                                }
                            }],
                            xAxes: [{
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

interface DayAverages {
    DayNumber: number;
    AvgAnger: number;
    AvgContempt: number;
    AvgDisgust: number;
    AvgFear: number;
    AvgHappiness: number;
    AvgNeutral: number;
    AvgSadness: number;
    AvgSurprise: number;
}
