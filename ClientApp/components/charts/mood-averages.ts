import { HttpClient } from 'aurelia-fetch-client';
import { inject } from 'aurelia-framework';
import * as _ from 'underscore'
import { Chart } from 'chart.js';
import * as moment from 'moment';
import { COMMON_MOODS, Mood } from '../../utils';

@inject(Element, HttpClient)
export class MoodAveragesCustomElement {
    public moods: Mood[];
    private _element: Element;
    public startPeriodFormat: string;
    public endPeriodFormat: string;

    constructor(element: Element, http: HttpClient) {
        this._element = element;        
        this.moods = COMMON_MOODS;

        var endPeriod = moment().endOf('day');
        var startPeriod = moment(endPeriod).add(-30, 'days');
        this.endPeriodFormat = endPeriod.format("MMMM Do"); ;
        this.startPeriodFormat = startPeriod.format("MMMM Do");

        http.fetch(`/api/charts/DayMoodsAverages?from=${startPeriod.toISOString()}&to=${endPeriod.toISOString()}`)
            .then(result => result.json() as Promise<DayAverages[]>)
            .then(data => {
                var chart = new Chart(this._element.getElementsByTagName('canvas')[0], {
                    type: 'line',
                    data: {
                        labels: _.map(data, g => g.DayNumber),
                        datasets: _.map(this.moods, mood => {
                            return {
                                label: mood.Name,
                                data: _.map(data, raw => raw['Avg' + mood.Name]),
                                backgroundColor: Chart.helpers.color(mood.Color).alpha(0.1).rgbString(),
                                borderColor: mood.Color
                            }
                        })
                    },
                    options: {
                        legend:{
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
                                    display : false,
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
