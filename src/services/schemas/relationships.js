import * as tools from '../tools/datatools'


export const relationships = {
    virtualUID: {
        function: tools.generateUIDLikeParent,
        virtual: true
    },
    ownerFilter: {
        function: function () {
            return true
        },
        virtual: true
    },
    memberFilter: {
        function: function () {
            return true
        },
        virtual: true
    },
    "DN": {
        function: function generateDn() {
            return this.object.virtualUID + ",OU=Relationship,DC=HPD,O=BAG,C=ch";
        },
        unique: true
    },
    "objectClass": {
        "values": [
            "groupOfNames",
        ]
    },
    "cn": {
        function: function generateDn() {
            return this.object.virtualUID;
        },
    },
    "member": {
        function: function getMembers() {
            let members = []
            if (this.db.relationships && this.db.relationships.length > 0)  {
                members = this.db.relationships.map(function (m){
                    return m.member.split(";")
                }).reduce((acc, val) => acc.concat(val), []);
            }
            let newMembers = []
            for (let p of this.db.professionals){
                if (members.indexOf(p.DN) >= 0) {
                    continue;
                }
                newMembers.push(p.DN)
            }
            return newMembers.join(';')

        }
    },
    "owner": {
        function: function getOwner() {
            return this.db.organizations[this.db.organizations.length - 1].DN;
        },
    }
}
