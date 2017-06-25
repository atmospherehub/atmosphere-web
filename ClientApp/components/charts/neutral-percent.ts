import { DatesRange } from './../date-range/date-range';
import { HttpClient } from 'aurelia-fetch-client';
import { inject, bindable } from 'aurelia-framework';
import * as _ from 'underscore'
import { Chart } from 'chart.js';
import * as moment from 'moment';

@inject(Element, HttpClient)
export class NeutralPercentCustomElement {
    @bindable public range: DatesRange;

    private _element: Element;
    private _http: HttpClient;
    private _chart: any;

    constructor(element: Element, http: HttpClient) {
        this._element = element;
        this._http = http;
    }

    public rangeChanged(newValue: moment.Moment, oldValue: moment.Moment) {

        if(this._chart != null) this._chart.destroy();
        this._http.fetch(`/api/charts/WeekDayNonNeutralPercent?from=${this.range.start.toISOString()}&to=${this.range.end.toISOString()}`)
            .then(result => result.json() as Promise<WeekDayStats[]>)
            .then(data => {
                this._chart = new Chart(this._element.getElementsByTagName('canvas')[0], {
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
