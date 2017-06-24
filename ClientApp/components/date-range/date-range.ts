import { inject } from 'aurelia-framework';
import * as $ from 'jquery'
import 'bootstrap-daterangepicker';
import * as moment from 'moment';

@inject(Element)
export class DateRangeCustomElement {
    private _element: Element;
    private _start: moment.Moment;
    private _end: moment.Moment;
    public selectedDatesRangeText: string;

    constructor(element: Element) {
        this._element = element;
        this._start = moment().startOf('month');
        this._end = moment().endOf('day');
    }

    attached() {
        let picker = $('.range-picker', this._element).daterangepicker({
            ranges: {
                'Today': [moment(), moment()],
                'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                'This Month': [moment().startOf('month'), moment()]
            },
            'startDate': this._start,
            'endDate': this._end,
            'maxDate': this._end,
            'opens': 'left',
            'applyClass': 'btn-primary'
        }, (start, end) => this.selectDatesRange(start, end))
            .on('show.daterangepicker', (e, popup) => {
                picker.addClass('active');
                $('.glyphicon', popup.container).each((e, el) => {
                    $(el).removeClass().addClass('fa fa-calendar-check-o');
                });
            })
            .on('hide.daterangepicker', () => {
                picker.removeClass('active');
            });
        this.selectDatesRange(picker.data('daterangepicker').startDate, picker.data('daterangepicker').endDate);
    }

    selectDatesRange(start, end) {
        this._start = start;
        this._end = end;

        // handle shortest possible display
        let sameYear = start.year() == end.year();
        let sameYearAndMonth = sameYear && start.month() == end.month();
        let sameYearMonthAndDay = sameYearAndMonth && start.day() == end.day();
        if (sameYearMonthAndDay) {
            this.selectedDatesRangeText = start.format(`MMM D YYYY`);
        }
        else {
            let startFormat = start.format(`MMM D${sameYear ? '' : ', YYYY'}`);
            let endFormat = end.format(`${sameYearAndMonth ? '' : 'MMM'} D, YYYY`);
            this.selectedDatesRangeText = `${startFormat} - ${endFormat}`;
        }
    }
}