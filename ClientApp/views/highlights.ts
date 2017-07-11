import { MoodsService, Mood } from "../services/moods";
import { autoinject } from 'aurelia-framework';

@autoinject()
export class Highlights {
    public selectedMoods: Mood[];

    constructor(moodsService: MoodsService) {
        this.selectedMoods = [];
        this.selectedMoods.push(moodsService.moods[0]);
    }
}

