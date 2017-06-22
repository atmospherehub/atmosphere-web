import { HttpClient } from 'aurelia-fetch-client';
import { inject } from 'aurelia-framework';
import _ from 'underscore';
import { Chart } from 'chart.js';

@inject(Element, HttpClient)
export class MoodSeries {
    public seriesData: SeriesGroup[];
    private _element: Element;

    constructor(element: Element, http: HttpClient) {
        this._element = element;
        var colors = {
            red: 'rgb(255, 99, 132)',
            orange: 'rgb(255, 159, 64)',
            yellow: 'rgb(255, 205, 86)',
            green: 'rgb(75, 192, 192)',
            blue: 'rgb(54, 162, 235)',
            purple: 'rgb(153, 102, 255)',
            grey: 'rgb(201, 203, 207)'
        };
        
        var moods = [{
            name: 'Anger',
            color: colors.red
        }, {
            name: 'Contempt',
            color: colors.orange
        }, {
            name: 'Disgust',
            color: colors.yellow
        }, {
            name: 'Fear',
            color: colors.purple
        }, {
            name: 'Happiness',
            color: colors.green
        }, {
            name: 'Sadness',
            color: colors.grey
        }, {
            name: 'Surprise',
            color: colors.blue
        }];

        http.fetch('')
            .then(result => result.json() as Promise<SeriesGroup[]>)
            .then(data => {
                this.seriesData = data;
                var chart = new Chart(this._element.getElementsByTagName('canvas')[0], {
                    type: 'line',
                    data: {
                        labels: _.map(data, g => g.GroupValue),
                        datasets: _.map(moods, mood => {
                            return {
                                label: mood.name,
                                data: _.map(data, raw => raw['Avg' + mood.name]),
                                backgroundColor: Chart.helpers.color(mood.color).alpha(0.1).rgbString(),
                                borderColor: mood.color
                            }
                        })
                    },
                    options: {
                        maintainAspectRatio: true,
                        elements: {
                            line: {
                                tension: 0.2,
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
                                    color: "rgba(0, 0, 0, 0)",
                                }
                            }]
                        }
                    }
                });
            });
    }
}

interface SeriesGroup {
    GroupValue: number;
    FormattedDate: Date;
    GroupCount: number;
    AvgAnger: number;
    AvgContempt: number;
    AvgDisgust: number;
    AvgFear: number;
    AvgHappiness: number;
    AvgNeutral: number;
    AvgSadness: number;
    AvgSurprise: number;
}
