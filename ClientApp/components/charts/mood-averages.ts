import { RestApi } from './../../services/rest-api';
import { inject } from 'aurelia-framework';
import { Chart } from 'chart.js';
import * as _ from 'underscore'
import { Toolbar, DatesRange } from './../../services/toolbar';
import { BaseChartCustomElement } from "./base-chart";
import { Mood } from "../../services/moods";

@inject(Element, RestApi, Toolbar)
export class MoodAveragesCustomElement extends BaseChartCustomElement<DayAverages> {

    constructor(element: Element, api: RestApi, toolbar: Toolbar) {
        super(element, api, toolbar);
    }

    getData(range: DatesRange): Promise<DayAverages[]> {
        return this._api.get<DayAverages[]>(
            `/charts/MoodsAverages?from=${range.start.toISOString()}&to=${range.end.toISOString()}`);
    }

    createChart(bindingData: any) : Chart {
        return new Chart(this._element.getElementsByTagName('canvas')[0], {
            type: 'line',
            data: bindingData,
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
    }

    getBindingData(moods: Mood[], data: DayAverages[]): any {
        return {
            labels: _.map(data, g => g.Group),
            datasets: _.map(moods, mood => {
                return {
                    label: mood.name,
                    data: _.map(data, raw => raw['Avg' + mood.name]),
                    backgroundColor: Chart.helpers.color(mood.color).alpha(0.1).rgbString(),
                    borderColor: mood.color
                }
            })
        };
    }
}

interface DayAverages {
    Group: number;
    AvgAnger: number;
    AvgContempt: number;
    AvgDisgust: number;
    AvgFear: number;
    AvgHappiness: number;
    AvgNeutral: number;
    AvgSadness: number;
    AvgSurprise: number;
}
