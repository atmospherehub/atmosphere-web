import { RestApi } from './../../services/rest-api';
import { autoinject, bindable } from 'aurelia-framework';
import { Chart } from 'chart.js';
import * as _ from 'underscore'
import { BaseChartCustomElement } from "./base-chart";
import { Mood } from "../../services/moods";
import { EventAggregator } from 'aurelia-event-aggregator';
import { DatesRange } from "../date-range/date-range";

@autoinject()
export class MoodDominantsCustomElement extends BaseChartCustomElement<DayDominants> {
    @bindable selectedMoods: Mood[];
    @bindable selectedRange: DatesRange;

    constructor(element: Element, api: RestApi,  eventAggregator: EventAggregator) {
        super(element, api, eventAggregator);
    }

    getData(range: DatesRange): Promise<DayDominants[]> {
        return this._api.get<DayDominants[]>(
            `/charts/DominantMoodsCounts?from=${range.start.toISOString()}&to=${range.end.toISOString()}`);
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
            datasets: _.map(this.selectedMoods, mood => {
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