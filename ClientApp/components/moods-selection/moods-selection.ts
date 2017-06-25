import { Toolbar, Mood } from './../../services/toolbar';
import * as _ from 'underscore'
import { bindable, inject } from 'aurelia-framework';

@inject(Toolbar)
export class MoodsSelectionCustomElement {
    private _moodsSelection: MoodWrapper[];
    private _toolbar: Toolbar;

    constructor(toolbar: Toolbar) {
        this._toolbar = toolbar;
        this._moodsSelection = _.map(toolbar.moods, m => {
            return {
                isSelected: true,
                item: m
            }
        });
    }

    public toggleMood(item: MoodWrapper) {
        item.isSelected = !item.isSelected;
        if (item.isSelected)
            this._toolbar.moods.push(item.item);
        else
            this._toolbar.moods.splice(this._toolbar.moods.indexOf(item.item), 1);
    }
}

interface MoodWrapper {
    item: Mood;
    isSelected: boolean;
}
