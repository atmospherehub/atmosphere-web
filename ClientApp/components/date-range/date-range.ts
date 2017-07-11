import { bindable, autoinject } from 'aurelia-framework';
import * as $ from 'jquery'
import 'bootstrap-daterangepicker';
import { EventAggregator } from 'aurelia-event-aggregator';
import * as moment from 'moment';

@autoinject()
export class DateRangeCustomElement {
    @bindable selectedRange: DatesRange; // moods that currently selected 
    private _datesRangeText: string;
    private _element: Element;
    private _eventAggregator: EventAggregator;

    constructor(element: Element, eventAggregator: EventAggregator) {
        this._element = element;
        this._eventAggregator = eventAggregator;
    }

    attached() {
        let pickerOptions = {
            ranges: {
                'Today': [moment(), moment()],
                'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                'This Month': [moment().startOf('month'), moment()],
                'Last 3 Months': [moment().subtract(3, 'months'), moment()],
            },
            startDate: this.selectedRange.start,
            endDate: this.selectedRange.end,
            maxDate: this.selectedRange.end,
            opens: 'left',
            applyClass: 'btn-primary'
        };

        let picker = $('.range-picker', this._element).daterangepicker(
            pickerOptions,
            (start, end) => {
                this.selectedRange.start = moment(start);
                this.selectedRange.end = moment(end);
                this._eventAggregator.publish('range_selection', this.selectedRange);
                this.setNiceText();
            }).on('show.daterangepicker', (e, popup) => {
                picker.addClass('active');
                $('.glyphicon', popup.container).each((e, el) => {
                    $(el).removeClass().addClass('fa fa-calendar-check-o');
                });
            }).on('hide.daterangepicker', () => {
                picker.removeClass('active');
            });
        this.setNiceText();
    }

    setNiceText() {
        let r = this.selectedRange;
        let sameYear = r.start.year() == r.end.year();
        let sameYearAndMonth = sameYear && r.start.month() == r.end.month();
        let sameYearMonthAndDay = sameYearAndMonth && r.start.day() == r.end.day();
        if (sameYearMonthAndDay) {
            this._datesRangeText = r.start.format(`MMM D YYYY`);
        }
        else {
            let startFormat = r.start.format(`MMM D${sameYear ? '' : ', YYYY'}`);
            let endFormat = r.end.format(`${sameYearAndMonth ? '' : 'MMM'} D, YYYY`);
            this._datesRangeText = `${startFormat} - ${endFormat}`;
        }
    }
}

export class DatesRange {
    start: moment.Moment;
    end: moment.Moment;

    constructor(start: moment.Moment, end: moment.Moment) {
        this.start = start;
        this.end = end;
    }

    toString(): String {
        return `${this.start} - ${this.end}`;
    }
}