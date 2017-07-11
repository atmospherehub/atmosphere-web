import { MoodsService, Mood } from "../services/moods";
import { autoinject } from 'aurelia-framework';

@autoinject()
export class SuperStars {
    public selectedMoods: Mood[];
    public selectedGroupBy: string;

    constructor(moodsService: MoodsService) {
        this.selectedMoods = [moodsService.moods[0]];
        this.selectedGroupBy = 'Day';
    }
}

