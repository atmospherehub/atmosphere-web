import { MoodsService, Mood } from "../services/moods";
import { inject } from 'aurelia-framework';
import { DatesRange } from "../components/date-range/date-range";
import * as moment from 'moment';

@inject(MoodsService)
export class Dashboard {
    public selectedMoods: Mood[];
    public selectedRange: DatesRange;

    constructor(moodsService: MoodsService) {
        this.selectedMoods = moodsService.moods;
        this.selectedRange = new DatesRange(moment().add(-10, 'd'), moment().endOf('day'));
    }
}

