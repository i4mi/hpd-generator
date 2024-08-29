import {relationships} from './relationships';

let copy = Object.assign({}, relationships);
let filterrelationshipClone = Object.assign(copy, {
    "member": {
        function: function getMembers() {
            let members = this.object.memberFilter.bind(this).call();
            return members.map(function MapMember(members) {
                return members.DN
            }).join(";");
        }
    },
    "owner": {
        function: function getOwner() {
            return this.object.ownerFilter.bind(this).call().DN;
        },
    }
});
delete filterrelationshipClone.counter;

export function filterrelationship (ownerFilter, memberFilter) {
    let newfilter = Object.assign({}, filterrelationshipClone);
    newfilter.ownerFilter = {
        function: function () {
            return ownerFilter || function () {
                return true;
            }
        },
        virtual: true
    };
    newfilter.memberFilter = {
        function: function () {
            return memberFilter || function () {
                return true;
            }
        },
        virtual: true
    };
    return newfilter;
};
