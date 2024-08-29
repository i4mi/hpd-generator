import { organization } from './organization';


let copy = Object.assign({}, organization);

export const ambulant = Object.assign(copy, {
    "customName": {
        static: 'Ambulantes Operations Zentrum',
        virtual: true
    },
    "businessCategory": {
        static: 'BAG:2.16.840.1.113883.6.96:35971002:Ambulatory care site'
    }
});
