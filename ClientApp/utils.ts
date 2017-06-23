export const COMMON_MOODS: Mood[] = [{
            Name: 'Anger',
            Color: 'rgb(255, 99, 132)'
        }, {
            Name: 'Contempt',
            Color: 'rgb(54, 162, 235)'
        }, {
            Name: 'Disgust',
            Color: 'rgb(255, 205, 86)'
        }, {
            Name: 'Fear',
            Color: 'rgb(201, 203, 207)'
        }, {
            Name: 'Happiness',
            Color: 'rgb(75, 192, 192)'
        }, {
            Name: 'Sadness',
            Color: 'rgb(153, 102, 255)'
        }, {
            Name: 'Surprise',
            Color: 'rgb(255, 159, 64)'
        }];

export interface Mood {
    Name: string;
    Color: string;
}