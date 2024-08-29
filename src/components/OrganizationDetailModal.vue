<script>
import { organization } from '@/services/schemas/organization';

export default {
    name: 'OrganizationDetailModal',
    data() {
        return {
        }
    },
    props: {
        organization: Object
    },
    methods: {
        close() {
            this.$emit('close');
        }
    },
    computed: {
        isPerson: function (app) {
            return app.organization.givenName != undefined;
        },
        title: function (app) {
            return this.isPerson
                ? app.organization.displayName
                : app.organization.HcRegisteredName
        },
        tableFields: function () {
            return this.isPerson
                ? [
                    'DN',                   //  "CommunityA:00000001005,OU=HCProfessional,DC=HPD,O=BAG,C=ch"
                    'HcIdentifier',         //  "RefData:GLN:9913048153443:inactive"
                    'HcProfession',         //  "BAG:2.16.840.1.113883.6.96:106292003:Professional nurse"
                    'HcRegistrationStatus', //  "unknown"
                    'HcSpecialisation',     //  "BAG:2.16.756.5.30.1.127.3.5:1050:Other"
                    // 'cn',                //  "Blanca, Bosshard"
                    'createTimeStamp',      //  "20240722124706.0Z"
                    // 'displayName',       //  "Blanca Bosshard"
                    // 'gender',            //  "f"
                    // 'givenName',         //  "Blanca"
                    'hpdMedicalRecordsDeliveryEmailAddress', //  "blanca.bosshard@delivery.com"
                    'hpdProviderLanguageSupported', //  "de;en"
                    'hpdProviderStatus',    //  "Active"
                    // 'mail',              //  "blanca.bosshard@email.com"
                    'objectClass',          //  "HCProfessional"
                    // 'sn',                //  "Bosshard"
                    // 'title',             //  ""
                    'uid'                   //  "CommunityA:00000001005"
                ]
                : [
                    'DN',                   // "CommunityB:00000005684,OU=HCRegulatedOrganization,DC=HPD,O=BAG,C=ch"
                    'HcIdentifier',         // "RefData:OID:2.16.10.89.201:inactive"
                    // 'HcRegisteredName',  // "Arztpraxis"
                    'HcSpecialisation',     // "BAG:2.16.840.1.113883.6.96:394914008:Radiology"
                    'businessCategory',     // "BAG:2.16.840.1.113883.6.96:264358009:General practice premises"
                    'createTimeStamp',      // "20240708144448.0Z"
                    'hpdProviderPracticeAddress', // "status=primary$addr=Arztpraxis$streetNumber=28b$streetName=Rue de Test$city=Village Teste$state=SH$postalCode=4417$country=CH"
                    'hpdProviderStatus'     // "Active
                ];
        }
    }
}
</script>

<template>
    <div class="modal" style="display: unset">
        <div class="modal-background"></div>
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">{{ title }}: Details</h5>
                    <button type="button" class="btn-close" v-on:click="close()" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th scope="col">Attribut</th>
                                <th scope="col">Wert</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="row in tableFields" class="info-row">
                                <th scope="row">
                                    {{ row }}
                                </th>
                                <td>
                                    {{ organization[row] }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
