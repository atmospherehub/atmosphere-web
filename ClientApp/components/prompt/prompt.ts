import { DialogController } from 'aurelia-dialog';
import { autoinject } from 'aurelia-framework';

@autoinject()
export class Prompt {
    private _controller: DialogController;
    private _model: PromptModel;

    constructor(controller: DialogController) {
        this._controller = controller;        
        controller.settings.lock = false;
        controller.settings.centerHorizontalOnly = true;
    }

    activate(model: PromptModel) {
        this._model = model;
    }
}

export interface PromptModel {
    text: string;
}