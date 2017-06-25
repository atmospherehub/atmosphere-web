import { HttpClient } from 'aurelia-fetch-client';
import { inject, bindable } from 'aurelia-framework';
import { Chart } from 'chart.js';
import * as _ from 'underscore'
import { Toolbar, DatesRange, Mood } from './../../services/toolbar';
import { BaseChartCustomElement } from "./base-chart";

@inject(Element, HttpClient, Toolbar)
export class MoodDominantsCustomElement extends BaseChartCustomElement<DayDominants> {

    constructor(element: Element, http: HttpClient, toolbar: Toolbar) {
        super(element, http, toolbar);
    }

    getData(range: DatesRange): Promise<DayDominants[]> {
        return this._http.fetch(`/api/charts/DominantMoodsCounts?from=${range.start.toISOString()}&to=${range.end.toISOString()}`)
            .then(result => result.json() as Promise<DayDominants[]>);
    }

    createChart(bindingData: any): Chart {
        return new Chart(this._element.getElementsByTagName('canvas')[0], {
            type: 'bar',
            data: bindingData,
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
                            display: false,
                        }
                    }]
                }
            }
        });
    }

    getBindingData(moods: Mood[], data: DayDominants[]): any {
        return {
            labels: _.map(data, g => g.Group),
            datasets: _.map(this._toolbar.moods, mood => {
                return {
                    label: mood.name,
                    data: _.map(data, raw => raw[mood.name]),
                    backgroundColor: mood.color
                }
            })
        };
    }
}

interface DayDominants {
    Group: number;
    Anger: number;
    Contempt: number;
    Disgust: number;
    Fear: number;
    Happiness: number;
    Sadness: number;
    Surprise: number;
}