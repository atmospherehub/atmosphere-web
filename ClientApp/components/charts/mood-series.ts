import { HttpClient } from 'aurelia-fetch-client';
import { inject } from 'aurelia-framework';
import * as _ from 'underscore'
import { Chart } from 'chart.js';

@inject(Element, HttpClient)
export class MoodSeriesCustomElement {
    public seriesData: DayAverages[];
    public moods: Mood[];
    private _element: Element;

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

        http.fetch('/api/charts/DayAveragesSeries?from=3/1/2017&to=3/30/2017')
            .then(result => result.json() as Promise<DayAverages[]>)
            .then(data => {
                this.seriesData = data;
                var chart = new Chart(this._element.getElementsByTagName('canvas')[0], {
                    type: 'line',
                    data: {
                        labels: _.map(data, g => g.dayNumber),
                        datasets: _.map(this.moods, mood => {
                            return {
                                label: mood.Name,
                                data: _.map(data, raw => raw['avg' + mood.Name]),
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
                                radius: 0
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
    dayNumber: number;
    avgAnger: number;
    avgContempt: number;
    avgDisgust: number;
    avgFear: number;
    avgHappiness: number;
    avgNeutral: number;
    avgSadness: number;
    avgSurprise: number;
}

interface Mood {
    Name: string;
    Color: string;
}
