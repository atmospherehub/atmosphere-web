import { bindable, inject } from 'aurelia-framework';
import * as $ from 'jquery'
import 'bootstrap-daterangepicker';
import * as moment from 'moment';

@inject(Element)
export class DateRangeCustomElement {
    @bindable public range: DatesRange;
    public DatesRangeText: string;
    private _element: Element;

    constructor(element: Element) {
        this._element = element;
    }

    attached() {
        this.range = new DatesRange(moment().startOf('month'), moment().endOf('day'));
        let pickerOptions = {
            ranges: {
                'Today': [moment(), moment()],
                'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                'This Month': [moment().startOf('month'), moment()]
            },
            startDate: this.range.start,
            endDate: this.range.end,
            maxDate: this.range.end,
            opens: 'left',
            applyClass: 'btn-primary'
        };

        let picker = $('.range-picker', this._element).daterangepicker(
            pickerOptions,
            (start, end) => {
                this.range = new DatesRange(start, end);
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
        let sameYear = this.range.start.year() == this.range.end.year();
        let sameYearAndMonth = sameYear && this.range.start.month() == this.range.end.month();
        let sameYearMonthAndDay = sameYearAndMonth && this.range.start.day() == this.range.end.day();
        if (sameYearMonthAndDay) {
            this.DatesRangeText = this.range.start.format(`MMM D YYYY`);
        }
        else {
            let startFormat = this.range.start.format(`MMM D${sameYear ? '' : ', YYYY'}`);
            let endFormat = this.range.end.format(`${sameYearAndMonth ? '' : 'MMM'} D, YYYY`);
            this.DatesRangeText = `${startFormat} - ${endFormat}`;
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
}