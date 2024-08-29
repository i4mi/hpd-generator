import {organization} from './organization';

let copy = Object.assign({}, organization);


export const reha = Object.assign(copy, {
    "customName": {
        static: 'Reha-Klinik',
        virtual: true
    },
    "businessCategory": {
        static: 'BAG:2.16.840.1.113883.6.96:22232009:Hospital'
    }
});
