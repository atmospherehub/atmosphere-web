import * as _ from 'underscore'
import { bindable, autoinject } from 'aurelia-framework';
import { MoodsService, Mood } from "../../services/moods";
import { EventAggregator } from 'aurelia-event-aggregator';

@autoinject()
export class MoodsSelectionCustomElement {
    @bindable selectedMoods: Mood[]; // moods that currently selected 
    private _toolBarMoods: MoodWrapper[]; // moods displayed for selection
    private _moodsService: MoodsService;
    private _eventAggregator: EventAggregator;

    constructor(moodsService: MoodsService, eventAggregator: EventAggregator) {
        this._moodsService = moodsService;
        this._eventAggregator = eventAggregator;
    }

    attached(): void {
        this._toolBarMoods = _.map(this._moodsService.moods, m => {
            return {
                isSelected: !!_.find(this.selectedMoods, i => i.name === m.name),
                item: m
            }
        });
    }

    public toggleMood(item: MoodWrapper) {
        item.isSelected = !item.isSelected;
        var changedItem: Mood = null;
        if (item.isSelected) {
            changedItem = item.item;
            this.selectedMoods.push(changedItem);
        }
        else {
            changedItem = _.find(this.selectedMoods, i => i.name === item.item.name);
            this.selectedMoods.splice(this.selectedMoods.indexOf(changedItem), 1);
        }
        this._eventAggregator.publish('moods_selection', changedItem);
    }
}

interface MoodWrapper {
    item: Mood;
    isSelected: boolean;
}
