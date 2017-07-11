import * as _ from 'underscore';
import { bindable, autoinject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';

@autoinject()
export class GroupBySelectionCustomElement {
    @bindable selected: string;
    private _eventAggregator: EventAggregator;
    private _toolBarGroups: GroupWrapper[];

    constructor(eventAggregator: EventAggregator) {
        this._eventAggregator = eventAggregator;
        this._toolBarGroups = [
            { name: 'Day', isSelected: false },
            { name: 'Week', isSelected: false },
            { name: 'Month', isSelected: false }];
    }

    attached(): void {
        _.find(this._toolBarGroups, i => i.name == this.selected).isSelected = true;
    }

    public toggleGroup(item: GroupWrapper) {
        if (item.name === this.selected) {
            return;
        }

        item.isSelected = true;
        _.find(this._toolBarGroups, i => i.name == this.selected).isSelected = false;
        this.selected = item.name;
        this._eventAggregator.publish('groups_selection', item.name);
    }
}

interface GroupWrapper {
    name: string;
    isSelected: boolean;
}
