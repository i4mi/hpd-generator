import * as tools from './tools/datatools';

const worker = new Worker(
    new URL('./webworkers/generateWorker', import.meta.url),
    {type: 'module'}
);

export function generateRelationships(lookup, edges, data) {
    let reverseLookup = {};
    for (let i of Object.entries(lookup)) {
        reverseLookup[i[1]] = i[0];
    }

    let dataLookup = {};

    [...data.organizations, ...data.professionals].forEach((obj) => {
        dataLookup[obj.DN] = obj;
    });

    const updateMembers = (relationship) => {
        relationship.member.split(';').forEach((member) => {
            dataLookup[member].memberOf = relationship.DN;   
        });
    }

    let relationships = [];
    for (let i of edges) {
        if (i.to === -1 || i.from === -1) {
            continue;
        }
        let relationship = {
            DN: "",
            objectClass: "top;groupOfNames",
            cn: "",
            member: "",
            owner: "",
            createTimeStamp: new Date().toISOString(),
            modifyTimeStamp: undefined
        };

        relationship.member = reverseLookup[i.to];
        relationship.owner = reverseLookup[i.from];
        if (!relationship.owner || !relationship.member
            || relationship.member.includes("OU=CHCommunity")) {
            continue;
        }
        let alreadyAddedRelationship = relationships.filter(function (a) {
            return a.owner === relationship.owner;
        });
        if (alreadyAddedRelationship.length > 0) {
            alreadyAddedRelationship[0].member += ";" + relationship.member;
            alreadyAddedRelationship[0].modifyTimeStamp = new Date().toISOString();
            updateMembers(alreadyAddedRelationship[0]);
        } else {
            if (relationship.owner.includes("OU=CHCommunity")) {
                relationship.cn = relationship.owner.split('uid=').at(-1).split(',')[0] +":".padEnd(8, '0');
                if (relationship.cn.includes("CommunityC")) {
                    relationship.cn += "3000";
                }
                if (relationship.cn.includes("CommunityB")) {
                    relationship.cn += "2000";
                }
                if (relationship.cn.includes("CommunityA")) {
                    relationship.cn += "1000";
                }
                relationship.DN = "CN=" + relationship.cn + ",OU=Relationship,DC=HPD,O=BAG,C=ch";
                relationships.push(relationship);
            } else {
                relationship.cn = relationship.owner.split('uid=').at(-1).split(',')[0] + tools.idGenerator().toString().padStart(3, '0');
                relationship.DN = "CN=" + relationship.cn + ",OU=Relationship,DC=HPD,O=BAG,C=ch";
                relationships.push(relationship);
            }
            updateMembers(relationship);
        }
    }
    return relationships;
}

export function generateData(options) { 
    const CHUNK_SIZE = 2; // size of chunks we split the request to (number of departments)

    return new Promise((resolve) => {
        let lastSentMessageID = 0;

        let isFirstResponse = true;
        let data = {
            organizations: [],
            professionals: [],
            relationships: [],
        };

        const processResponse = (e) => {
            Object.keys(e.data).forEach((key) => {
                if (key != 'messageID') {
                    data[key] = data[key].concat(e.data[key]);
                }
            });

            // when we have the uid from the first answer, we can send the other chunks 
            if (isFirstResponse) {
                isFirstResponse = false;
                for (let i = CHUNK_SIZE; i < options.departments?.length; i += CHUNK_SIZE) {
                    worker.postMessage([{
                        amount: options.amount,
                        type: options.type,
                        national: options.national,
                        name: options.name,
                        departments: [...options.departments].splice(i, CHUNK_SIZE),
                        uid: e.data.organizations[0].uid, // make sure that all sub-orgs are in the same top-org
                        messageID: ++lastSentMessageID
                    }]);
                }
            }
            
            if (parseInt(e.data.messageID) == lastSentMessageID) {
                worker.removeEventListener('message', processResponse);
                return resolve(data);
            }
        }

        worker.addEventListener('message', processResponse, false);

        worker.postMessage([{   
            amount: options.amount,
            type: options.type,
            national: options.national,
            name: options.name,
            departments: options.departments
                ? [...options.departments].splice(0, CHUNK_SIZE)
                : undefined,
            messageID: 0
        }]);
        
        
    });
}