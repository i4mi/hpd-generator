import {professionals} from './professionals';

let copy = Object.assign({}, professionals);

export const caregiver = Object.assign(copy, {
    "HcSpecialisation": {
        "values": [
            "BAG:2.16.756.5.30.1.127.3.5:1050:Other"
        ]
    },
    HcProfession: {
        "values": [
            "BAG:2.16.840.1.113883.6.96:106292003:Professional nurse",
        ]
    },
    title: {
        "values": [
            "",
        ]
    },
});
