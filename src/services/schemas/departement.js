import * as tools  from '../tools/datatools';
import {organization} from './organization';

let copy = Object.assign({}, organization);


let departementObj = Object.assign(copy, {
    "customName": {
        static: 'Departement',
        virtual: true
    },
    virtualUID: {
        function: tools.generateUIDLikeParent,
        virtual: true
    },
    "businessCategory": {
        function: function () {
            return "BAG:2.16.840.1.113883.6.96:22232009:Departement"
        }
    }
});

export function departement (override) {
if (!override instanceof Object) {
        override = {};
    }

    let copy = Object.assign({}, departementObj);

    return Object.assign(copy, override);
};
