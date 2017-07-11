import * as _ from 'underscore';
import { bindable, autoinject } from 'aurelia-framework';
import { MoodsService, Mood } from "../../services/moods";
import { EventAggregator } from 'aurelia-event-aggregator';

@autoinject()
export class MoodsSelectionCustomElement {
    @bindable selectedMoods: Mood[]; // moods that currently selected 
    @bindable multiSelect: boolean = false;
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
        if (!this.multiSelect && item.item.name === this.selectedMoods[0].name) {
            return;
        }

        if (this.multiSelect) {
            item.isSelected = !item.isSelected;
            if (item.isSelected) {
                this.selectedMoods.push(item.item);
            }
            else {
                this.selectedMoods.splice(
                    this.selectedMoods.indexOf(_.find(this.selectedMoods, i => i.name === item.item.name)),
                    1);
            }
        }
        else {
            item.isSelected = true;
            _.find(this._toolBarMoods, i => i.item.name == this.selectedMoods[0].name).isSelected = false;
            this.selectedMoods.splice(0, 1);
            this.selectedMoods.push(item.item);
        }
        this._eventAggregator.publish('moods_selection', item.item);
    }
}

interface MoodWrapper {
    item: Mood;
    isSelected: boolean;
}
