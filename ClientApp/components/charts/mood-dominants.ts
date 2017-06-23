import { HttpClient } from 'aurelia-fetch-client';
import { inject } from 'aurelia-framework';
import * as _ from 'underscore'
import { Chart } from 'chart.js';
import * as moment from 'moment';

@inject(Element, HttpClient)
export class MoodDominantsCustomElement {
    public moods: Mood[];
    private _element: Element;
    public startPeriodFormat: string;
    public endPeriodFormat: string;

    constructor(element: Element, http: HttpClient) {
        this._element = element;

        this.moods = [{
            Name: 'Anger',
            Color: 'rgb(255, 99, 132)'
        }, {
            Name: 'Contempt',
            Color: 'rgb(255, 159, 64)'
        }, {
            Name: 'Disgust',
            Color: 'rgb(255, 205, 86)'
        }, {
            Name: 'Fear',
            Color: 'rgb(153, 102, 255)'
        }, {
            Name: 'Happiness',
            Color: 'rgb(75, 192, 192)'
        }, {
            Name: 'Sadness',
            Color: 'rgb(201, 203, 207)'
        }, {
            Name: 'Surprise',
            Color: 'rgb(54, 162, 235)'
        }];

        var endPeriod = moment().endOf('day');
        var startPeriod = moment(endPeriod).add(-30, 'days');
        this.endPeriodFormat = endPeriod.format("MMMM Do");;
        this.startPeriodFormat = startPeriod.format("MMMM Do");

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

interface Mood {
    Name: string;
    Color: string;
}
