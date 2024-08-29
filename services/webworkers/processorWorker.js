onmessage = (e) => {
    const data = e.data.data;
    const lookupTable = e.data.lookupTable;
    
    const returnObject = {
        networkToAdd: [],
        lookupTable: lookupTable,
        memberToAdd: [],
        generatedData: JSON.parse(e.data.generatedData),
        a: e.data.a
    };

    data.organizations.forEach((organization) => {
        returnObject.generatedData.organizations.push(organization);
        returnObject.networkToAdd.push({
            type: 'node',
            data: {id: returnObject.a, label: organization.o, color: "#0644F1"}
        });
        const community = organization.DN.split(":")[0];
        const id = returnObject.a;
        if (!lookupTable[community + ",OU=CHCommunity,DC=CPI,O=BAG,C=ch"]) {
            returnObject.a++;
            returnObject.networkToAdd.push({
                type: 'node',
                data: {id: returnObject.a, label: community, shape: "box", color: "#f0003c"}
            });
            returnObject.networkToAdd.push({
                type: 'edge',
                data: {to: -1, from: returnObject.a, length: 400}
            });
            returnObject.lookupTable[community + ",OU=CHCommunity,DC=CPI,O=BAG,C=ch"] = returnObject.a;
        }
        returnObject.lookupTable[organization.DN] = id;
        if (organization.businessCategory.match(/264358009|288565001|Hospital|35971002/i)) {
            returnObject.networkToAdd.push({
                type: 'edge',
                data: {to: returnObject.lookupTable[community + ",OU=CHCommunity,DC=CPI,O=BAG,C=ch"], from: id, length: 400}
            });
        }
        returnObject.a++;
    });

    data.professionals.forEach((professional) => {
        returnObject.generatedData.professionals.push(professional);
        returnObject.networkToAdd.push({
            type: 'node',
            data: {id: returnObject.a, label: professional.displayName, color: "#0399AC"}
        });
        returnObject.lookupTable[professional.DN] = returnObject.a;
        returnObject.a++;
    });

    data.relationships.forEach((relationship) => {
        let owner = returnObject.generatedData.organizations.find((org) => org.DN === relationship.owner);
        if (!owner) {
            owner = returnObject.generatedData.professionals.find((prof) => prof.DN === relationship.owner);
        }
        const members = relationship.member.split(';');
        owner && members.forEach((member) => {
            returnObject.memberToAdd.push({o: owner, m: member});
            const from = returnObject.lookupTable[member];
            const to = returnObject.lookupTable[relationship.owner];
            if (to && from) {
                returnObject.networkToAdd.push({
                    type: 'edge',
                    data: {to: to, from: from, length: 200}
                });
            }
        });
    });

    postMessage(returnObject);
};