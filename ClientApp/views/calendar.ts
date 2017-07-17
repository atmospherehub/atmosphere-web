import { autoinject } from 'aurelia-framework';
import { RestApi } from './../services/rest-api';
import { Router } from 'aurelia-router';
import * as moment from 'moment';
import 'fullcalendar';
import * as $ from 'jquery'
import * as _ from 'underscore'

@autoinject()
export class Dashboard {
    private _router: Router;
    private _element: Element;
    private _calendarObject: any;
    private _api: RestApi;
    private _isLoading: boolean;
    private _plugin: any;
    private _defaultDate: moment.Moment;

    constructor(element: Element, api: RestApi, router: Router) {
        this._element = element;
        this._api = api;
        this._router = router;
    }

    private activate(routeParams: any): void {
        if (this._plugin == null && !routeParams.currentDate) {
            // plugin not initialized and not params in route => fall to defaults
            return;
        }

        let currentDate = moment(routeParams.currentDate);
        if (!currentDate.isValid) {
            // don't deal with non valid input from route
            return;
        }

        if (this._plugin == null) {
            // plugin not initialized => pass router params to plugin init
            this._defaultDate = currentDate;
            return;
        }

        // plugin initialized => set the date according to route
        this.plugin('gotoDate', currentDate);
    }

    private attached(): void {
        this._plugin = this.plugin({
            header: {
                left: '',
                center: 'title',
                right: 'cprev,ctoday,cnext'
            },
            timeFormat: 'HH:mm',
            defaultView: 'month',
            defaultDate: this._defaultDate,
            dayClick: (date, jsEvent, view) => this._router.navigate(`calendar/${date.format("YYYY-MM-DD")}/day`),
            events: (start, end, timezone, callback) => this.getData(start, end).then((data) => callback(data)),
            customButtons: {
                cprev: {
                    click: () => this._router.navigate(`calendar/${this.plugin('getDate').add(-1, 'M').format("YYYY-MM-DD")}`),
                    icon: 'left-single-arrow'
                },
                cnext: {
                    click: () => this._router.navigate(`calendar/${this.plugin('getDate').add(1, 'M').format("YYYY-MM-DD")}`),
                    icon: 'right-single-arrow'
                },
                ctoday: {
                    click: () => this._router.navigate(`calendar/${moment().format("YYYY-MM-DD")}`),
                    text: 'today'
                }
            }
        });
    }

    private detached(): void {
        this.plugin('destroy');
    }

    private getData(start: moment.Moment, end: moment.Moment): Promise<any[]> {
        this._isLoading = true;
        return this._api
            .get<Day[]>(`/calendar/days?from=${start.toISOString()}&to=${end.toISOString()}`)
            .then((days) => {
                this._isLoading = false;
                return _
                    .chain(days)
                    .map((day) => {
                        if (day.TotalPersons < 1) return [];
                        return [{
                            title: 'First person',
                            start: day.FirstPerson,
                            className: 'event-blue'
                        }, {
                            title: 'Last person',
                            start: day.LastPerson,
                            className: 'event-green'
                        }, {
                            title: `Σ ${day.TotalPersons} | 😊 ${Math.floor(day.AvgHappiness * 100)}% | 😢 ${Math.floor(day.AvgSadness * 100)}%`,
                            start: moment(day.FirstPerson).add(1, 'ms'),
                            end: day.LastPerson,
                            className: 'event-azure event-stats',
                            allDay: false,
                            url: this._router.generate(`calendar-day`, { date: moment(day.FirstPerson).format("YYYY-MM-DD") })
                        }];
                    })
                    .flatten(true)
                    .value();
            });
    }

    private plugin(param1: any, param2?: any) {
        return $('#full-calendar', this._element).fullCalendar(param1, param2);
    }
}

interface Day {
    FirstPerson: Date;
    LastPerson: Date;
    TotalPersons: number;
    AvgHappiness: number;
    AvgSadness: number;
}

