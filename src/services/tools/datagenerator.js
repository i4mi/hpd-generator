import mocker from 'mocker-data-generator';
import {professionals} from '../schemas/professionals';
import {relationships} from '../schemas/relationships';
import {departement} from '../schemas/departement';
import {filterrelationship} from '../schemas/filterrelationship';

export function DataGenerator() {
    this.instance = mocker();
}

DataGenerator.prototype.add = function (name, schema, amount, customName, customUid) {
    const customSchema = {...schema};
    if (!amount) {
        amount = 1;
    }
    if (customName) {
        console.warn('Generating with custom name is not supported at the moment. (customName=' + customName +')');
        customSchema.customName = {
            static: customName,
                virtual: true
        };
    }

    if (customUid) {
        customSchema.virtualUID = {
            static: customUid,
            virtual: true
        };
        customSchema.pseudoOrganization = {
            static: true
        };
    }

    this.instance.schema(name, customSchema, amount);
}


DataGenerator.prototype.addRelationShipwithLastOrganisation = function (amount) {
    this.instance.schema('relationships', relationships, amount);
}

DataGenerator.prototype.addDepartement = function (name) {
    this.instance.schema('organizations', departement({
        "customName": {
            static: name,
            virtual: true
        },
    }), 1);
}

DataGenerator.prototype.addProfessionalsToOrganisation = function (professionals, amount) {
    this.instance.schema('professionals', professionals, amount);
    this.instance.schema('relationships', relationships, amount);
}

DataGenerator.prototype.addProfessionals = function (amount) {
    this.instance .schema('professionals', professionals, amount);
}

DataGenerator.prototype.addProfessionalRelationship = function (ownerKey, ownerValueRegex, memberKey, memberValueRegex) {
    this.instance.schema('relationships', filterrelationship(function () {
        return this.db.professionals.filter(function (org) {
            return org[ownerKey].match(ownerValueRegex);
        })[0];
    }, function () {
        return this.db.professionals.filter(function (org) {
            return org[memberKey].match(memberValueRegex)
        });
    }), 1)
}

DataGenerator.prototype.addRelationship = function (ownerKey, ownerValueRegex, memberKey, memberValueRegex) {
    this.instance.schema('relationships', filterrelationship(function () {
        return this.db.organizations.filter(function (org) {
            return org[ownerKey].match(ownerValueRegex);
        })[0];
    }, function () {
        return this.db.organizations.filter(function (org) {
            return org[memberKey].match(memberValueRegex)
        });
    }), 1)
}


DataGenerator.prototype.build = function () {
    return this.instance.build().finally(() => this.instance.reset());
}