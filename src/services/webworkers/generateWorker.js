import { DataGenerator } from '../tools/datagenerator';
import mocker from 'mocker-data-generator';
import {professionals} from '../schemas/professionals';
import {relationships} from '../schemas/relationships';
import {hospital} from '../schemas/hospital';
import {universityhospital} from '../schemas/universityhospital';
import {caregiver} from '../schemas/caregiver';
import {doctorsoffice} from '../schemas/doctorsoffice';
import {radiology} from '../schemas/radiology';
import {ambulant} from '../schemas/ambulant';
import {reha} from '../schemas/reha';
import { TYPES } from '../../types';

function filterPseudoOrganizations(data) {
    // remove duplicate that where generated with custom uid
    data.organizations = data.organizations.filter(o => {
        const filter = !o.pseudoOrganization;
        delete o.pseudoOrganization;
        return filter;
    });
    return data;
}

function isDoctorGroup(group) {
    const lowerCase = group.toLowerCase();
    return  lowerCase.indexOf('ärzte') > -1 || 
            lowerCase.indexOf('anästhesisten') > -1 ||
            lowerCase.indexOf('operateure') > -1;
}

function answerMessage(data, options) {
    data.messageID = options.messageID;
    postMessage(data);
}



onmessage = (e) => {
    let datagen = new DataGenerator();
    const options = e.data[0];

    mocker().restart();

    let mainDepartements = [];
    switch (options.type) {
        case 'doctor': 
            datagen.add("professionals", professionals, options.amount || 3, options.parentCommunity);
            return datagen.build().then((data) => answerMessage(data, options));
        case 'caregiver': 
            datagen.add("professionals", caregiver, options.amount ||3, options.parentCommunity);
            return datagen.build().then((data) => answerMessage(data, options));
        // case 'assistant': 
        //     datagen.add("professionals", assistant, options.amount ||3);
        //     return datagen.build();
        case 'universityhospital':
            datagen.add('organizations', universityhospital, 1, options.name, options.uid);
            mainDepartements = options.departments || [...TYPES.department].sort(() => 0.5 - Math.random()).slice(0,4); // get 4 random elements
            for (let dep of mainDepartements) {
                datagen.addDepartement(dep);
                datagen.addDepartement(dep + ' Pflege');
                datagen.addProfessionalsToOrganisation(caregiver, options.amount || 3);
                datagen.addDepartement(dep + ' Ärzte');
                datagen.addProfessionalsToOrganisation(professionals, options.amount || 3);
                datagen.addRelationship(
                    "HcRegisteredName", new RegExp("^" + dep + "$"),
                    "HcRegisteredName", new RegExp("^" + dep + ' Ärzte' + "$|^" + dep + ' Pflege' + "$")
                );
            }
            datagen.addRelationship(
                "HcRegisteredName", /Universitätsspital/,
                "HcRegisteredName", new RegExp("^" + mainDepartements.join("$|^") + "$")
            );
            return datagen.build().then((data) => {
                answerMessage(filterPseudoOrganizations(data), options);
            });
        case 'doctoroffice':
            datagen.add('organizations', doctorsoffice, 1, options.name, options.uid);
            mainDepartements = options.departments || [...TYPES.group].slice(0,2);
            mainDepartements.forEach((dep) => {
                datagen.addDepartement(dep);
                datagen.addProfessionalsToOrganisation(
                    isDoctorGroup(dep) ? professionals : caregiver, 
                    options.amount || 3
                );
                datagen.addRelationship(
                    "HcRegisteredName", /Arztpraxis/,
                    "HcRegisteredName", new RegExp("^" + dep + "$"),
                );
            });
            return datagen.build().then((data) => {
                answerMessage(filterPseudoOrganizations(data), options);
            });
        case 'radiology': 
            datagen.add('organizations', radiology, 1, options.name, options.uid);
            mainDepartements = options.departments || ['Ärzte',' Radiologieassistenzen', 'Praxisassistenz'];
            mainDepartements.forEach((dep) => {
                datagen.addDepartement(dep);
                datagen.addProfessionalsToOrganisation(isDoctorGroup(dep) ? professionals : caregiver, options.amount || 3);
                datagen.addRelationship(
                    "HcRegisteredName", /Radiologie-Zentrum/,
                    "HcRegisteredName", new RegExp("^" + dep + "$"),
                );
            }); 
            return datagen.build().then((data) => {
                answerMessage(filterPseudoOrganizations(data), options);
            });
        case 'ambulant': 
            datagen.add('organizations', ambulant, 1, options.name, options.uid);
            mainDepartements = options.departments || ['Ärzte',' Operateure', 'Praxisassistenzen', 'Technische Operationsassistenzen'];
            mainDepartements.forEach((dep) => {
                datagen.addDepartement(dep);
                datagen.addProfessionalsToOrganisation(isDoctorGroup(dep) ? professionals : caregiver, options.amount || 3);
                datagen.addRelationship(
                    "HcRegisteredName", /Ambulantes Operationszentrum/,
                    "HcRegisteredName", new RegExp("^" + dep + "$"),
                );
            }); 
            return datagen.build().then((data) => {
                answerMessage(filterPseudoOrganizations(data), options);
            });
        case 'hospital': 
            datagen.add('organizations', hospital, 1, options.name, options.uid);
            mainDepartements = options.departments || [...TYPES.group].slice(0,2);
            mainDepartements.forEach((dep) => {
                datagen.addDepartement(dep);
                datagen.addProfessionalsToOrganisation(
                    isDoctorGroup(dep) ? professionals : caregiver, 
                    options.amount || 3
                );
                datagen.addRelationship(
                    "HcRegisteredName", /Spital/,
                    "HcRegisteredName", new RegExp("^" + dep + "$"),
                );
            });
            return datagen.build().then((data) => {
                answerMessage(filterPseudoOrganizations(data), options);
            });
        case 'reha':    
            datagen.add('organizations', reha, 1, options.name, options.uid);
            mainDepartements = options.departments || [...TYPES.group].slice(0,3);
            mainDepartements.forEach((dep) => {
                datagen.addDepartement(dep);
                datagen.addProfessionalsToOrganisation(
                    isDoctorGroup(dep) ? professionals : caregiver, 
                    options.amount || 3
                );
                datagen.addRelationship(
                    "HcRegisteredName", /Reha/,
                    "HcRegisteredName", new RegExp("^" + dep + "$"),
                );
            });
            return datagen.build().then((data) => {
                answerMessage(filterPseudoOrganizations(data), options);
            });
        case 'bighospital':  
            datagen.add('organizations', hospital, 1, options.name, options.uid);
            mainDepartements = options.departments || ['Arztpraxis', 'Medizin', 'Chirurgie'];
            for (let dep of mainDepartements) {
                datagen.addDepartement(dep);
                datagen.addDepartement(dep + ' Pflege');
                datagen.addProfessionalsToOrganisation(caregiver, 3);
                datagen.addDepartement(dep + ' Ärzte');
                datagen.addProfessionalsToOrganisation(professionals, 3);
                datagen.addRelationship(
                    "HcRegisteredName", new RegExp("^" + dep + "$"),
                    "HcRegisteredName", new RegExp("^" + dep + ' Ärzte' + "$|^" + dep + ' Pflege' + "$")
                );
            }
            datagen.addRelationship(
                "HcRegisteredName", /Spital/,
                "HcRegisteredName", new RegExp("^" + mainDepartements.join("$|^") + "$")
            );
            return datagen.build().then((data) => {
                answerMessage(filterPseudoOrganizations(data), options);
            });
        case 'department':
            const dep = options.name || 'Abteilung'
            datagen.addDepartement(dep);
            datagen.addDepartement(dep + ' Pflege');
            datagen.addProfessionalsToOrganisation(caregiver, 3);
            datagen.addDepartement(dep + ' Ärzte');
            datagen.addProfessionalsToOrganisation(professionals, 3);
            datagen.addRelationship(
                "HcRegisteredName", new RegExp("^" + dep + "$"),
                "HcRegisteredName", new RegExp("^" + dep + ' Ärzte' + "$|^" + dep + ' Pflege' + "$")
            );
            return datagen.build().then((data) => answerMessage(data, options));
        case 'group': 
            datagen.addDepartement(options.name || 'Personal');
            datagen.addProfessionalsToOrganisation(professionals, options.professionalsAmount || 3);
            return datagen.build().then((data) => answerMessage(data, options));
        case 'basics':
        default: 
            return mocker()
                .schema('organizations', organizations, 1)
                .schema('professionals', professionals, 1)
                .schema('relationships', relationships, 1)
                .build().then(answerMessage);
    }
};