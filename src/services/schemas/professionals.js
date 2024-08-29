import * as tools  from '../tools/datatools';


export const professionals = {
    virtualPerson: {
        function: tools.generatePerson,
        virtual: true
    },
    virtualUID: {
        function: tools.generateUIDLikeParent,
        virtual: true
    },
    relationships: {
        function: function () {

        },
        virtual: true
    },
    "DN": {
        function: function generateDN() {
            return this.object.virtualUID.indexOf('uid=') === -1
                ? 'uid=' + this.object.virtualUID + ",OU=HCProfessional,DC=HPD,O=BAG,C=ch"
                : this.object.virtualUID + ",OU=HCProfessional,DC=HPD,O=BAG,C=ch";
        }
    },
    "objectClass": {
        "values": [
            "top;naturalPerson;HPDProvider;person;organizationalPerson;inetOrgPerson;HCProfessional",
        ]
    },
    "cn": {
        function: function generateDn() {
            return this.object.virtualPerson.firstName + ', ' + this.object.virtualPerson.lastName + ', ' + this.object.virtualUID
        }
    },

    "title": {
        "values": [
            "Dr.",
        ]
    },
    "displayName": {
        function: function () {
            return (this.object.title ? this.object.title + ' ' : '') + this.object.virtualPerson.firstName + " " + this.object.virtualPerson.lastName;
        }
    },
    "createTimeStamp": {
        function: tools.generateDateTime
    },
    modifyTimeStamp: {
        function: () => {
            return Math.random() > 0.5
                ? tools.generateDateTime(2.4)
                : undefined
        }
    },
    "gender": {
        "values": [
            "m",
            "f",
        ]
    },
    "uid": {
        function: function generateDn() {
            return this.object.virtualUID;
        },
    },
    "HcRegistrationStatus": {
        "values": [
            "unknown",
        ]
    },
    "hpdMedicalRecordsDeliveryEmailAddress": {
        function: function generateDn() {

            return this.object.virtualPerson.firstName.toLowerCase() + "." + this.object.virtualPerson.lastName.toLowerCase() + "@delivery.com";
        }
    },
    "hpdProviderLanguageSupported": {
        "values": [
            "de;fr;en",
            "de;en;it",
            "de;en",
            "de;fr",
            "de;fr;en;it",
        ]
    },
    "mail": {
        function: function generateDn() {

            return this.object.virtualPerson.firstName.toLowerCase() + "." + this.object.virtualPerson.lastName.toLowerCase() + "@email.com";
        }
    },
    "HcIdentifier": {
        function: tools.generateHCIdentifier
    },
    "sn": {
        function: function lastName() {
            return this.object.virtualPerson.lastName;
        }
    },
    "HcSpecialisation": {
        "values": [
            "BAG:2.16.756.5.30.1.127.3.5:1050:Other",
            "BAG:2.16.756.5.30.1.127.3.5:1014:Neurology",
            "BAG:2.16.756.5.30.1.127.3.5:1051:General internal medicine;BAG:2.16.756.5.30.1.127.3.5:1002:Surgery",
            "BAG:2.16.756.5.30.1.127.3.5:1030:Radiology",
            "BAG:2.16.756.5.30.1.127.3.5:1003:Gynaecology and obstetrics",
            "BAG:2.16.756.5.30.1.127.3.5:1007:Ophthalmology",
            "BAG:2.16.756.5.30.1.127.3.5:1042:Intensive care medicine;BAG:2.16.756.5.30.1.127.3.5:1007:Ophthalmology;BAG:2.16.756.5.30.1.127.3.5:1050:Other"
        ]
    },
    "HcProfession": {
        "values": [
            "BAG:2.16.840.1.113883.6.96:309343006:Physician;BAG:2.16.840.1.113883.6.96:36682004:Physiotherapist;BAG:2.16.840.1.113883.6.96:106289002:Dentist",
            "BAG:2.16.840.1.113883.6.96:309343006:Physician",
            "BAG:2.16.840.1.113883.6.96:309343006:Physician;BAG:2.16.840.1.113883.6.96:36682004:Physiotherapist",
        ]
    },
    "hpdProviderStatus": {
        "values": [
            "Active",
        ]
    },
    "givenName": {
        function: function firstName() {

            return this.object.virtualPerson.firstName;
        }
    },
}
