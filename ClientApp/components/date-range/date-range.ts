import { bindable, inject } from 'aurelia-framework';
import * as $ from 'jquery'
import 'bootstrap-daterangepicker';
import * as moment from 'moment';
import { Toolbar, DatesRange } from './../../services/toolbar';

@inject(Element, Toolbar)
export class DateRangeCustomElement {
    private _datesRangeText: string;
    private _element: Element;
    private _toolbar: Toolbar;

    constructor(element: Element, toolbar: Toolbar) {
        this._element = element;
        this._toolbar = toolbar;
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
            startDate: this._toolbar.range.start,
            endDate: this._toolbar.range.end,
            maxDate: this._toolbar.range.end,
            opens: 'left',
            applyClass: 'btn-primary'
        };

        let picker = $('.range-picker', this._element).daterangepicker(
            pickerOptions,
            (start, end) => {
                this._toolbar.range = new DatesRange(start, end);
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
        let r = this._toolbar.range;
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