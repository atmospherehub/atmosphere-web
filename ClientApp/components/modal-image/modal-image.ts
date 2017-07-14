import { DialogController } from 'aurelia-dialog';
import { autoinject } from 'aurelia-framework';

@autoinject()
export class ModalImage {
    private _controller: DialogController;
    private _model: ImageModel;

    private _currentImage: string;
    private _isZoomIn: boolean;

    constructor(controller: DialogController) {
        this._controller = controller;
    }

    activate(model: ImageModel) {
        this._model = model;
        this._currentImage = model.imageUrl;
        this._isZoomIn = false;
    }

    private toggleImageSize(): void {
        this._isZoomIn = !this._isZoomIn;
        if (this._isZoomIn)
            this._currentImage = this._model.downloadImageUrl;
        else
            this._currentImage = this._model.imageUrl;
    }
}

export interface ImageModel {
    imageUrl: string;
    downloadImageUrl: string;
    text: string;
}