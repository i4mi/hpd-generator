import * as tools  from '../tools/datatools';
import faker from 'faker';

export const organization = {
    customName: {
        static: '',
        virtual: true
    },
    virtualName: {
        function: function generateName() {
            if (this.object.customName && this.object.customName !== '') {
                return this.object.customName
            }
            return "Gesundheitseinrichtung"
        },
        virtual: true
    },
    virtualUID: {
        function: tools.generateUID,
        virtual: true
    },
    DN: {
        function: function generateDN() {
            return this.object.virtualUID.indexOf('uid=') === -1
                ? 'uid=' + this.object.virtualUID + ",OU=HCRegulatedOrganization,DC=HPD,O=BAG,C=ch"
                : this.object.virtualUID + ",OU=HCRegulatedOrganization,DC=HPD,O=BAG,C=ch";
        }
    },
    pseudoOrganization: {
        static: false
    },
    objectClass: {
        "values": [
            "top;uidObject;HPDProvider;organization;HCRegulatedOrganization",
        ]
    },
    exampleVirtual: {
        incrementalId: 1,
        virtual: true
    },
    o: {
        function: function () {
            return this.object.virtualName
        }
    },
    businessCategory: {
        function: function () {

            faker.locale = "de_CH";
            if (type === 'hospital') {
                return "BAG:2.16.840.1.113883.6.96:22232009:Hospital";
            }
            if (type === 'departement') {
                return "BAG:2.16.840.1.113883.6.96:22232009:Abt. " + this.object.exampleVirtual;
            }
            if (type === 'doctoroffice') {
                return "BAG:2.16.840.1.113883.6.96:264358009:General practice premises";
            }
            if (type === 'ambulatory') {
                return "BAG:2.16.840.1.113883.6.96:35971002:Ambulatory care site";
            }
            if (type === 'reha') {
                return "BAG:2.16.840.1.113883.6.96:80522000:Rehabilitation hospital";
            }
            if (type === 'emergency') {
                return "BAG:2.16.840.1.113883.6.96:225728007:Accident and Emergency department";
            }
            return "BAG:2.16.840.1.113883.6.96:43741000:Site of care";
        },
    },
    telephoneNumber: {
        function: tools.generatePhoneNumbers
    },
    createTimeStamp: {
        function: tools.generateDateTime
    },
    modifyTimeStamp: {
        function: () => {
            return Math.random() > 0.5
                ? tools.generateDateTime(1.6)
                : undefined
        }
    },
    HcRegisteredName: {
        function: function () {
            return this.object.virtualName
        }
    },
    hpdProviderPracticeAddress: {
        // as LDAP address https://ldapwiki.com/wiki/Wiki.jsp?page=Postal%20Address_LDAPSyntax
        function: function () {
            faker.locale = "de_CH";
            let address = tools.generateAddress()
            return "status=primary$addr="
                + address.streetName + ' '
                + address.streetNumber + '$'
                + address.zipCode + ' '
                + address.city + ' '
                + address.stateAbbr
                + "$city=" + address.city
                 + "$country=CH";
        },
    },
    uid: {
        function: function generateDn() {
            return this.object.virtualUID;
        },
    },
    HcIdentifier: {
        function: function() {
            return tools.generateOID() + ';' + tools.generateBUR()
        }
    },
    HcSpecialisation: {
        values: [
            "BAG:2.16.840.1.113883.6.96:394802001:General medicine",
            "BAG:2.16.840.1.113883.6.96:394576009:Accident and emergency;BAG:2.16.840.1.113883.6.96:419192003:Internal medicine",
            "BAG:2.16.840.1.113883.6.96:394576009:Accident and emergency",
            "BAG:2.16.840.1.113883.6.96:394579002:Cardiology",
            "BAG:2.16.840.1.113883.6.96:394591006:Neurology",
            "BAG:2.16.840.1.113883.6.96:394582007:Dermatology",
            "BAG:2.16.840.1.113883.6.96:408465003:Oral and maxillofacial surgery",
            "BAG:2.16.840.1.113883.6.96:394586005:Gynecology",
            "BAG:2.16.840.1.113883.6.96:394802001:General medicine",
            "BAG:2.16.840.1.113883.6.96:394802001:General medicine",
            "BAG:2.16.840.1.113883.6.96:394914008:Radiology",
            "BAG:2.16.840.1.113883.6.96:416304004:Osteopathic manipulative medicine",
            "BAG:2.16.840.1.113883.6.96:394594003:Clinical pathology service",
            "BAG:2.16.840.1.113883.6.96:394586005:Gynecology",
            "BAG:2.16.840.1.113883.6.96:394802001:General medicine",
            "BAG:2.16.840.1.113883.6.96:394802001:General medicine",
            "BAG:2.16.840.1.113883.6.96:416304004:Osteopathic manipulative medicine"
        ]
    },
    hpdProviderStatus: {
        values: [
            "Active",
        ]
    }
}
