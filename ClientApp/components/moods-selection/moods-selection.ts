import {bindable} from 'aurelia-framework';

export class MoodsSelectionCustomElement {
    @bindable private _moodsSelection: ItemSelected<Mood>[];

    constructor() {
        this._moodsSelection = [{
            isSelected: true,
            item: {
                name: 'Anger',
                color: 'rgb(255, 99, 132)'
            }
        }, {
            isSelected: true,
            item: {
                name: 'Contempt',
                color: 'rgb(54, 162, 235)'
            }
        }, {
            isSelected: true,
            item: {
                name: 'Disgust',
                color: 'rgb(255, 205, 86)'
            }
        }, {
            isSelected: true,
            item: {
                name: 'Fear',
                color: 'rgb(201, 203, 207)'
            }
        }, {
            isSelected: true,
            item: {
                name: 'Happiness',
                color: 'rgb(75, 192, 192)'
            }
        }, {
            isSelected: true,
            item: {
                name: 'Sadness',
                color: 'rgb(153, 102, 255)'
            }
        }, {
            isSelected: true,
            item: {
                name: 'Surprise',
                color: 'rgb(255, 159, 64)'
            }
        }];
    }

    public toggleMood(item: ItemSelected<Mood>)
    {
        item.isSelected = !item.isSelected;
    }
}

interface ItemSelected<T> {
    item: T;
    isSelected: boolean;
}

export interface Mood {
    name: string;
    color: string;
}

export class BackgroundCssValueConverter {
  toView(value) {
      console.log(value);
      return value.isSelected ? value.item.color : 'transparent';
  }
}

export class ColorCssValueConverter {
  toView(value) {
    return value.isSelected ? '#fff' : value.item.color;
  }
}