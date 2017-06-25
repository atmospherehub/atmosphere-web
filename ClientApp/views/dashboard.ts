import { DatesRange } from './../components/date-range/date-range';
import { ItemSelected, Mood } from './../components/moods-selection/moods-selection';
import {bindable} from 'aurelia-framework';
import * as moment from 'moment';

export class Dashboard {
    public range: DatesRange;
    public moods: ItemSelected<Mood>;
}

