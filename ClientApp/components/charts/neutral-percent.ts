import { Toolbar, DatesRange, Mood } from './../../services/toolbar';
import { HttpClient } from 'aurelia-fetch-client';
import { inject, bindable } from 'aurelia-framework';
import * as _ from 'underscore'
import { Chart } from 'chart.js';
import { BaseChartCustomElement } from "./base-chart";

@inject(Element, HttpClient, Toolbar)
export class NeutralPercentCustomElement extends BaseChartCustomElement<WeekDayStats> {

    constructor(element: Element, http: HttpClient, toolbar: Toolbar) {
        super(element, http, toolbar);
    }

    getData(range: DatesRange): Promise<WeekDayStats[]> {
        return this._http.fetch(`/api/charts/WeekDayNonNeutralPercent?from=${range.start.toISOString()}&to=${range.end.toISOString()}`)
            .then(result => result.json() as Promise<WeekDayStats[]>)
    }

    createChart(bindingData: any): Chart {
        return new Chart(this._element.getElementsByTagName('canvas')[0], {
            type: 'line',
            data: bindingData,
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
    }
    
    getBindingData(moods: Mood[], data: WeekDayStats[]): any {
        return {
            labels: _.map(data, g => ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][g.WeekDay - 1]),
            datasets: [{
                data: _.map(data, day => _.reduce(moods, (memo, mood) => memo + day['Sum' + mood.name], 0) / day.SumNeutral ),
                fill: 'end'
            }]
        };
    }
}

interface WeekDayStats {
    WeekDay: number;
    Total: number;
    SumAnger: number;
    SumContempt: number;
    SumDisgust: number;
    SumFear: number;
    SumHappiness: number;
    SumSadness: number;
    SumSurprise: number;
    SumNeutral: number;
}
