import {organization} from './organization';

let copy = Object.assign({}, organization);

export const radiology = Object.assign(copy, {
    "customName": {
        static: 'Radiologie-Zentrum',
        virtual: true
    },
    "businessCategory": {
        static: 'BAG:2.16.840.1.113883.6.96:288565001:Medical center'
    }
});
