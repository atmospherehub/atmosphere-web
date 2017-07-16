import { autoinject } from 'aurelia-framework';
import { RestApi } from './../services/rest-api';
import * as moment from 'moment';
import 'fullcalendar';
import * as $ from 'jquery'
import * as _ from 'underscore'

@autoinject()
export class Dashboard {
    private _element: Element;
    private _api: RestApi;
    private _isLoading: boolean;

    constructor(element: Element, api: RestApi) {
        this._element = element;
        this._api = api;
    }

    private activate(date: string): void {
        
    }

    private attached(): void {
        $('#full-calendar', this._element).fullCalendar({
            header: {
                left: '',
                center: 'title',
                right: 'prev,next today'
            },
            timeFormat: 'HH:mm',
            defaultDate: new Date(),
            defaultView: 'month',
            dayClick: function (date, jsEvent, view) {

                alert('Clicked on: ' + date.format());

            },
            events: (start, end, timezone, callback) => {
                this._isLoading = true;
                this._api
                    .get<Day[]>(`/calendar/days?from=${start.toISOString()}&to=${end.toISOString()}`)
                    .then((days) => {
                        callback(_
                            .chain(days)
                            .map((day) => {
                                if (day.TotalPersons < 1) return [];
                                return [{
                                    title: 'First person',
                                    start: day.FirstPerson,
                                    className: 'event-blue',
                                    allDay: false,
                                    url: `/#/calendar/${day.FirstPerson}/first-person`
                                }, {
                                    title: 'Last person',
                                    start: day.LastPerson,
                                    className: 'event-green',
                                    allDay: false,
                                    url: `/#/calendar/${day.FirstPerson}/last-person`
                                }, {
                                    title: `Σ ${day.TotalPersons} | 😊 ${Math.floor(day.AvgHappiness * 100)}% | 😢 ${Math.floor(day.AvgSadness * 100)}%`,
                                    start: day.FirstPerson,
                                    className: 'event-azure',
                                    allDay: true
                                }];
                            })
                            .flatten(true)
                            .value());
                        this._isLoading = false;
                    });
            }
        });
    }

    private detached():void{
        $('#full-calendar', this._element).fullCalendar('destroy');
    }
}

interface Day {
    FirstPerson: Date;
    LastPerson: Date;
    TotalPersons: number;
    AvgHappiness: number;
    AvgSadness: number;
}

