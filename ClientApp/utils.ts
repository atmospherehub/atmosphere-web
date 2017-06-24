export const COMMON_MOODS: Mood[] = [{
            name: 'Anger',
            color: 'rgb(255, 99, 132)'
        }, {
            name: 'Contempt',
            color: 'rgb(54, 162, 235)'
        }, {
            name: 'Disgust',
            color: 'rgb(255, 205, 86)'
        }, {
            name: 'Fear',
            color: 'rgb(201, 203, 207)'
        }, {
            name: 'Happiness',
            color: 'rgb(75, 192, 192)'
        }, {
            name: 'Sadness',
            color: 'rgb(153, 102, 255)'
        }, {
            name: 'Surprise',
            color: 'rgb(255, 159, 64)'
        }];

export interface Mood {
    name: string;
    color: string;
}