import { autoinject } from 'aurelia-framework';
import * as moment from 'moment';
import 'fullcalendar';
import * as $ from 'jquery'

@autoinject()
export class Dashboard {
    private _element: Element;
    public isLoading: boolean;

    constructor(element: Element) {
        this._element = element;
    }

    private attached(): void {
        let picker = $('#full-calendar', this._element).fullCalendar({
            header: {
                left: '',
                center: 'title',
                right: 'prev,next today'
            },
            timeFormat: 'HH(:mm)',
            defaultDate: new Date(),
            defaultView: 'month',
            dayClick: function (date, jsEvent, view) {

                alert('Clicked on: ' + date.format());

            },
            events: function (start, end, timezone, callback) {
                callback([{
                    title: 'First person',
                    start: new Date(2017, 6, 5, 8, 23),
                    className: 'event-blue',
                    allDay: false,
                    url: 'http://localhost:60191/#/calendar/first-person'
                },{
                    title: 'Last person',
                    start: new Date(2017, 6, 5, 23, 23),
                    className: 'event-green',
                    allDay: false,
                    url: 'http://localhost:60191/#/calendar/last-person'
                },{
                    title: 'Σ 223 😊 23% 😢 22%',
                    start: new Date(2017, 6, 5),
                    className: 'event-azure',
                    allDay: true,
                    borderColor: '#ff0000'
                }]);
            }
        });
    }
}

