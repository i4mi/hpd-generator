import {relationships} from './relationships';

let copy = Object.assign({}, relationships);

delete copy.counter;

export const organisationrelationship = Object.assign(copy, {
    organisationalincrement: {
        incrementalId: 0,
        virtual: true
    },
    "member": {
        function: function getMembers() {
            return this.db.organizations[this.db.organizations.length - 1].DN;
        }
    },
    "owner": {
        function: function getOwner() {
            return this.db.organizations[this.db.organizations.length - 2].DN;
        },
    }
});
