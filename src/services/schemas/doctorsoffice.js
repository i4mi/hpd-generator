import {organization} from './organization';

let copy = Object.assign({}, organization);


export const doctorsoffice = Object.assign(copy, {
    "customName": {
        static: 'Arztpraxis',
        virtual: true
    },
    "businessCategory": {
        static: 'BAG:2.16.840.1.113883.6.96:264358009:General practice premises'
    }
});
