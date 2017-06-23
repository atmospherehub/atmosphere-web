import { HttpClient } from 'aurelia-fetch-client';
import { inject } from 'aurelia-framework';
import * as _ from 'underscore'
import { Chart } from 'chart.js';
import * as moment from 'moment';
import { COMMON_MOODS, Mood } from '../../utils';

@inject(Element, HttpClient)
export class NeutralPercentCustomElement {
    public moods: Mood[];
    private _element: Element;

    constructor(element: Element, http: HttpClient) {
        this._element = element;
        this.moods = COMMON_MOODS;

        var endPeriod = moment().endOf('day');
        var startPeriod = moment(endPeriod).add(-30, 'days');

        http.fetch(`/api/charts/WeekDayNonNeutralPercent?from=${startPeriod.toISOString()}&to=${endPeriod.toISOString()}`)
            .then(result => result.json() as Promise<WeekDayStats[]>)
            .then(data => {
                var chart = new Chart(this._element.getElementsByTagName('canvas')[0], {
                    type: 'line',
                    data: {
                        labels: _.map(data, g => ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][g.WeekDay - 1]),
                        datasets: [{
                            data: _.map(data, g => g.PercentNonNeutral),
                            fill: 'end'
                        }]
                    },
                    options: {
                        spanGaps: false,
                        elements: {
                            line: {
                                tension: 0.000001
                            }
                        },
                        plugins: {
                            filler: {
                                propagate: false
                            }
                        },
                        scales: {
                            xAxes: [{
                                ticks: {
                                    autoSkip: false,
                                    maxRotation: 0
                                },
                                gridLines: {
                                    display: false,
                                }
                            }],
                            yAxes: [{
                                ticks: {
                                    display: false
                                },
                                gridLines: {
                                    display: false,
                                }
                            }]
                        },
                        legend: {
                            display: false
                        },
                        maintainAspectRatio: false
                    }
                });
            });
    }
}

interface WeekDayStats {
    WeekDay: number;
    Total: number;
    PercentNonNeutral: number;
}
