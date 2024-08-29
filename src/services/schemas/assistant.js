import {professionals} from './professionals';

let copy = Object.assign({}, professionals);

export const assistant = Object.assign(copy, {
    "HcSpecialisation": {
        "values": [
            "BAG:2.16.756.5.30.1.127.3.5:1050:Other"
        ]
    },
    "objectClass": {
        "values": [
            "Assistant"
        ]
    },
    "HcProfession": {
        "values": [
            "BAG:2.16.840.1.113883.6.96:309343006:Physician",
        ]
    },
    "title": {
        "values": [
            "assistant",
        ]
    },
    "DN": {
        function: function generateDN() {
            return this.object.virtualUID + ",OU=Assistant,DC=HPD,O=BAG,C=ch";
        }
    },
}
);
