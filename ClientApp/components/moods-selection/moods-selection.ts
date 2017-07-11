import { Toolbar } from './../../services/toolbar';
import * as _ from 'underscore'
import { bindable, inject } from 'aurelia-framework';
import { MoodsService, Mood } from "../../services/moods";

@inject(Toolbar, MoodsService)
export class MoodsSelectionCustomElement {
    private _moodsSelection: MoodWrapper[];
    private _toolbar: Toolbar;

    constructor(toolbar: Toolbar, moodsService: MoodsService) {
        this._toolbar = toolbar;
        this._moodsSelection = _.map(moodsService.moods, m => {
            return {
                isSelected: !!_.find(this._toolbar.moods, i => i.name === m.name),
                item: m
            }
        });
    }

    public toggleMood(item: MoodWrapper) {
        item.isSelected = !item.isSelected;
        if (item.isSelected)
            this._toolbar.moods.push(item.item);
        else {
            var toRemove = _.find(this._toolbar.moods, i => i.name === item.item.name);
            this._toolbar.moods.splice(this._toolbar.moods.indexOf(toRemove), 1);
        }
    }
}

interface MoodWrapper {
    item: Mood;
    isSelected: boolean;
}
