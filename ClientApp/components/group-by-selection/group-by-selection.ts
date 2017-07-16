import * as _ from 'underscore';
import { bindable, autoinject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';

@autoinject()
export class GroupBySelectionCustomElement {
    @bindable selectedGroup: string;
    private _eventAggregator: EventAggregator;
    private _toolBarGroups: GroupWrapper[];

    constructor(eventAggregator: EventAggregator) {
        this._eventAggregator = eventAggregator;
        this._toolBarGroups = [
            { name: 'DayOfYear', isSelected: false },
            { name: 'Week', isSelected: false },
            { name: 'Month', isSelected: false }];
    }

    attached(): void {
        _.find(this._toolBarGroups, i => i.name == this.selectedGroup).isSelected = true;
    }

    public toggleGroup(item: GroupWrapper) {
        if (item.name === this.selectedGroup) {
            return;
        }

        item.isSelected = true;
        _.find(this._toolBarGroups, i => i.name == this.selectedGroup).isSelected = false;
        this.selectedGroup = item.name;
        this._eventAggregator.publish('groups_selection', item.name);
    }
}

interface GroupWrapper {
    name: string;
    isSelected: boolean;
}
