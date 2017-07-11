import { MoodsService, Mood } from "../services/moods";
import { autoinject } from 'aurelia-framework';
import { DatesRange } from "../components/date-range/date-range";
import * as moment from 'moment';

@autoinject()
export class Dashboard {
    public selectedMoods: Mood[];
    public selectedRange: DatesRange;

    constructor(moodsService: MoodsService) {
        this.selectedMoods = moodsService.moods;
        this.selectedRange = new DatesRange(moment().add(-10, 'd'), moment().endOf('day'));
    }
}

