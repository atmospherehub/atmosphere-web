import { DatesRange } from './../date-range/date-range';
import { ItemSelected, Mood } from './../moods-selection/moods-selection';
import { HttpClient } from 'aurelia-fetch-client';
import { bindable, inject } from 'aurelia-framework';
import * as _ from 'underscore'
import { Chart } from 'chart.js';
import * as moment from 'moment';

@inject(Element, HttpClient)
export class MoodAveragesCustomElement {
    @bindable public range: DatesRange;
    @bindable public moods: ItemSelected<Mood>[];

    private _element: Element;
    private _http: HttpClient;
    private _chart: any;

    constructor(element: Element, http: HttpClient) {
        this._element = element;
        this._http = http;
    }

    public rangeChanged(newValue: moment.Moment, oldValue: moment.Moment) {        
        if(this._chart != null) this._chart.destroy();

        this._http.fetch(`/api/charts/MoodsAverages?from=${this.range.start.toISOString()}&to=${this.range.end.toISOString()}`)
            .then(result => result.json() as Promise<DayAverages[]>)
            .then(data => {
                this._chart = new Chart(this._element.getElementsByTagName('canvas')[0], {
                    type: 'line',
                    data: {
                        labels: _.map(data, g => g.Group),
                        datasets: _.map(this.moods, mood => {
                            return {
                                label: mood.item.name,
                                data: _.map(data, raw => raw['Avg' + mood.item.name]),
                                backgroundColor: Chart.helpers.color(mood.item.color).alpha(0.1).rgbString(),
                                borderColor: mood.item.color
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
