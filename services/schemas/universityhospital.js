import {hospital} from './hospital';

let copy = Object.assign({}, hospital);

export const universityhospital = Object.assign(copy, {
    "customName": {
        "values": [
            "Universitätsspital"
        ],
        virtual: true
    },
    "businessCategory": {
        static: 'BAG:2.16.840.1.113883.6.96:22232009:Hospital'
    }
});
