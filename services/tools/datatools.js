import {DateTime} from 'luxon';
import faker from 'faker/locale/de_CH';

function getIsActive() {
    return faker.random.arrayElements([':active', ':inactive'], 1)[0];
}

export function createIDGenerator() {
    let i = 0;
    return function () {
        i++;
        return i;
    }
}

export const idGenerator = createIDGenerator();

export const generateUIDLikeParent = function GenerateDN() {
    if (this.db.organizations && this.db.organizations.length > 0) {
        return this.db.organizations[this.db.organizations.length - 1].DN // get parent UID
            .split('uid=').at(-1) // remove 'uid='
            .substr(0, 19)  // only use first part
            + idGenerator().toString().padStart(3, '0') // generate own uid
    } else {
        return generateUID();
    }
}

let i = 0;
export const generateUID = function GenerateDN() {
    if (i === 0) {
        i++;
        let uid = 1000 + idGenerator();
        return "CommunityA:0000000" + uid;
    }
    if (i === 1) {
        i++;
        let uid = 2000 + idGenerator();
        return "CommunityB:0000000" + uid;

    }
    i = 0;
    let uid = 3000 + idGenerator();
    return "CommunityC:0000000" + uid;

}

export function generateDateTime(offset = 0) {
    let a = new Date();
    if (offset > 0) {
        a.setTime(a.getTime() + 1000 * 60 * 60 * offset);
    }
    return a.toISOString();
}

export function generateHCIdentifier() {
    let glnid = 9999999999999 - Math.floor(Math.random() * 100000000000)

    return "RefData:GLN:" + glnid + getIsActive();
}

export function generateOID() {
    return 'RefData:OID:2.16.756.5.30.' +
            Math.floor(Math.random() * 10) + '.' + 
            Math.floor(Math.random() * 10) + '.' + 
            Math.floor(Math.random() * 10) + '.' + 
            Math.floor(Math.random() * 1000) +
            getIsActive();
}

export function generateBUR() {
    let burnr = faker.datatype.number({
        'min': 1000000,
        'max': 9999999
    });

    return "BFS:BUR:" + burnr + generateChecksum(burnr) + getIsActive();
}

export function generateChecksum(nr) {
    let sum = 0;
    let str = nr.toString()
    const weight = [8, 6, 4, 2, 3, 5, 9, 7];
    for (let i = 0; i < str.length; i++) {
        sum += weight[i] * Number(str[i]);
    }

    let modulo = sum % 11;

    switch(modulo) {
        case 1: 
            return '0';
        case 11: 
            return '5';
        default:
            return (11 - modulo).toString();
    }
}


export function generatePhoneNumbers() {
    let arr = Array(Math.ceil(Math.random() * 2)).fill(0).map(generatePhoneNumber);
    return arr.join(",")
}

export function generatePhoneNumber() {
    return "+41 " + faker.datatype.number({
        'min': 10,
        'max': 70
    }) + " " + faker.datatype.number({
        'min': 100,
        'max': 999
    }) + " " + faker.datatype.number({
        'min': 10,
        'max': 99
    }) + " " + faker.datatype.number({
        'min': 10,
        'max': 99
    });
}

export function generateAddress() {
    return {
        streetName: faker.random.arrayElements(['Teststrasse', 'Testweg', 'Seeteststrasse', 'Testbrückenstrasse', 'Rue Test', 'Rue de Test', 'Strade di Test'], 1)[0],
        streetNumber: faker.datatype.number({
            'min': 1,
            'max': 40
        }) + faker.random.arrayElements(['a', 'b', 'c', '', '', '', '', '', '', '', ''], 1)[0],
        stateAbbr: faker.random.arrayElements([
            "AG", "AR", "AI", "BL", "BS", "BE",
            "FR", "GE", "GL", "GR", "JU", "LU",
            "NE", "NW", "OW", "SG", "SH", "SZ",
            "SO", "TI", "TG", "UR", "VD", "VS",
            "ZG", "ZH",
        ], 1)[0],
        zipCode: faker.datatype.number({
            'min': 1000,
            'max': 9000
        }),
        city: faker.random.arrayElements(
            ['Teststadt', 'Testdorf','Village Teste', 'Ville Teste'], 1)[0]
    }
}

export function generatePerson() {
    let gender = faker.random.arrayElements(['m', 'f'], 1)[0]

    let person = {
        firstName: (gender === 'm' ? faker.name.firstName('male') : faker.name.firstName('female')),
        lastName: faker.name.lastName(),
        gender: gender,
        title: faker.name.title(),
    }
    return person;
}