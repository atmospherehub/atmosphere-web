import { Toolbar } from './../../services/toolbar';
import { bindable, inject } from 'aurelia-framework';

@inject(Toolbar)
export class GroupBySelectionCustomElement {
    private _toolbar: Toolbar;

    constructor(toolbar: Toolbar) {
        this._toolbar = toolbar;
    }
}
