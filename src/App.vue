<script>
import OrganizationDetailModal from './components/OrganizationDetailModal.vue';
import SubOrganisationList from './components/SubOrganisationList.vue';
import AddOrgModal from './components/AddOrgModal.vue';
import { TYPES } from './types';
import * as network from './services/network';
import * as generator from './services/generator';
import * as archiver from './services/tools/archiver';
import * as pkgjson from '../package.json';

const processorWorker = new Worker(
    new URL('./services/webworkers/processorWorker', import.meta.url),
    {type: 'module'}
);

function addMember(owner, member) {
    if (member === '') return;
    if (owner.members) {
        owner.members.includes(member) || owner.members.push(member);
    } else {
        owner.members = [member];
    }
}

// TODO: can be partly replaced by passing parent id directly to generator
function mapDataToExistingCommunity(data, parentCommunity, parentCounter) {
    const lookup = [];
    const updateIDs = (dataset, i) => {
        let counter = (baseCounter + i).toString();
        
        while (counter.length < 11) { // needs 11 numbers
            counter = '0' + counter;
        }
        const uid = parentCommunity + ':' + counter;
        dataset.DN = uid + dataset.DN.substring(dataset.DN.indexOf(','));
        lookup.push({old: dataset.uid, new: uid})
        dataset.uid = uid;
    };

    let baseCounter = parentCounter + 1;
    if (data.organizations) {
        data.organizations.map((d, i) => updateIDs(d,i));
        baseCounter += data.organizations.length;
    }
    data.professionals.map((d, i) => updateIDs(d,i));
    baseCounter += data.professionals.length;

    if (data.relationships) {
        // remove relationships without members TODO: needed?
        data.relationships = data.relationships.filter(r => r.member != '');
        data.relationships.map((rel, i) => {
            let counter = (baseCounter + i).toString();
        
            while (counter.length < 11) { // needs 11 numbers
                counter = '0' + counter;
            }
            const uid = parentCommunity + ':' + counter;
            rel.DN = uid + rel.DN.substring(rel.DN.indexOf(','));
            rel.cn = uid;
            lookup.forEach((pair) => {
                rel.member = rel.member.replace(pair.old, pair.new.split('uid=').at(-1));
                rel.owner = rel.owner.replace(pair.old, pair.new.split('uid=').at(-1));
            });
        });
    }
    return data;
}

export default {
    name: 'App',
    components: {
        'organization-detail-modal': OrganizationDetailModal,
        'add-org-modal': AddOrgModal,
        'sub-organization-list': SubOrganisationList
    },
    data: () => ({
        types: TYPES,
        generatedData: {
            organizations: [],
            professionals: [],
        },
        counter: 1,
        amount: 1,
        national:true,
        lookupTable: {},
        hierarchicalView: false,
        networkEnabled: true,
        activeTab: 1,
        tabs: [ 'Grafik', 'Tabelle'],
        accordionExpanded: [],
        organizationButtons: [
            { label: 'Arztpraxis', type: 'doctoroffice', icon: 'fa-user-md' },
            { label: 'Spital', type: 'hospital', icon: 'fa-hospital-o' },
            { label: 'Reha-Klinik', type: 'reha', icon: 'fa-hospital-o' },
            { label: 'Universitätsspital', type: 'universityhospital', icon: 'fa-hospital-o' },
            { label: 'Radiologie-Zentrum', type: 'radiology', icon: 'fa-hospital-o' },
            { label: 'Grosses Spital', type: 'bighospital', icon: 'fa-hospital-o' },
            //  { label: 'Ambulantes Operationszentrum', type: 'ambulant', icon: 'fa-hospital-o' }
        ],
        professionalButtons: [
            { label: 'Doktor', type: 'doctor', icon: 'fa-user-md' },
            { label: 'assistant', type: 'assistant', icon: 'fa-user-md' }
        ],
        modalOrganization: undefined,
        modalType: undefined,
        prepareError: undefined,
        generating: false,
        processing: false
    }),
    watch: {
        activeTab(newTab) {
            if (newTab === 0 && this.networkEnabled) {
                network.network.stabilize();
            }
        },
        networkEnabled(nowEnabled) {
            if (nowEnabled) {
                // todo: implement building network
                console.warn('TODO: Update network');
            }
        }
    },
    mounted() {
        this.networkEnabled && network.startNetwork();
        processorWorker.addEventListener('message', (e) => {
            this.networkEnabled && e.data.networkToAdd.forEach((element) => {
                switch(element.type) {
                    case 'node': 
                        network.addNode(element.data);
                        break;
                    case 'edge': 
                        network.addEdge(element.data.to, element.data.from, element.data.length);
                        break;
                }
            });
            e.data.memberToAdd.forEach((element) => {
                addMember(element.o, element.m);
            });

            this.counter = e.data.a;
            this.lookupTable = e.data.lookupTable;
            this.generatedData = e.data.generatedData;
            this.processing = false;
        }, false);
    },  
    methods: {
        toggleHierarchical: function() {
            this.hierarchicalView = !this.hierarchicalView;
            const options = this.hierarchicalView
                ? {
                    layout: {
                        hierarchical: {
                            direction: "UD",
                            sortMethod: 'directed',
                            nodeSpacing: 50,
                            levelSeparation: 200,
                            shakeTowards: 'leaves',
                            blockShifting: false,
                            edgeMinimization: false
                        }
                    },
                    physics: {
                        hierarchicalRepulsion: {
                            avoidOverlap: 0.7
                        }
                    }
                }
                : {
                    layout: {
                        hierarchical: false
                    },
                    physics: {
                        solver: 'barnesHut',
                    }
                } 
            network.network.setOptions(options);
           
            network.network.stabilize();
            network.redraw();
        },
        download: function() {
            const filename = 
                'testdata-' + 
                new Date().toISOString().substring(2,20)
                    .replaceAll('-','')
                    .replace('T','-')
                    .replaceAll(':','')
                    .replace('.','') + 
                '.zip';
            archiver.createCsvZip(
                {
                    relationships: generator.generateRelationships(this.lookupTable, network.getEdges(), this.generatedData),
                    organizations: this.generatedData.organizations.map((o) => {
                        const newOrg = {...o}
                        delete newOrg.members;
                        return newOrg;
                    }),
                    professionals: this.generatedData.professionals
                }
            ).then((zipped) => {
                if (window.navigator.msSaveOrOpenBlob) {
                    window.navigator.msSaveBlob(zipped, filename);
                }
                else {
                    const elem = window.document.createElement('a');
                    elem.href = window.URL.createObjectURL(zipped);
                    elem.download = filename;        
                    document.body.appendChild(elem);
                    elem.click();        
                    document.body.removeChild(elem);
                }
            }).catch(e => {
                console.error('something went wrong downloading zip', e);
            });
        },
        processLoadedData: function(data) {
            this.processing = true;
            if (this.networkEnabled && this.counter === 1) {
                network.resetAll();
                network.addNode({
                    id: -1, label: "HPD",color: "#1cc88a", font: {multi: "html", size: 20},
                });
            }
            processorWorker.postMessage({
                data: {...data},
                a: this.counter,
                lookupTable: {...this.lookupTable},
                generatedData: JSON.stringify(this.generatedData)
            });
        },
        add: function(params) {
            const type = this.getPeerType(params.parent)
            const parentCommunity = params.parent.DN.split(':')[0];
            
            switch (type) {
            case 'doctor':
            case 'caregiver':
                generator.generateData({
                    type: type,
                    amount: 1,
                    parentCommunity: parentCommunity
                }).then((data) => {
                    mapDataToExistingCommunity(data, parentCommunity, this.findHighestCommunityID(parentCommunity));

                    const professional = data.professionals[0];
                    this.generatedData.professionals.push(professional);
                    const lookupID = this.counter++; 
                    this.lookupTable[professional.DN] = lookupID;
                    let owner = this.generatedData.organizations.find((org) => org.DN === params.parent.DN);
                    if (!owner) {
                        owner = this.generatedData.professionals.find((prof) => prof.DN === params.parent.DN);
                    }
                    addMember(params.parent, professional.DN);
                    const to = this.lookupTable[params.parent.DN];
                    network.addNode({id: lookupID, label: professional.displayName, color: "#0399AC"});
                    if (to && lookupID) {
                        network.addEdge(to, lookupID, 200);
                    }
                    params.parent.members.push(professional.DN);
                });
                break;
            case 'department':
            case 'group':
                generator.generateData({
                    type: type,
                    amount: 1,
                    name:  this.getTypeName(type),
                    professionalsAmount: 3
                }).then((data) => {
                    // add a relationship to the given parent
                    data.relationships.push({
                        DN: 'temp,OU=Relationship,DC=HPD,O=BAG,C=ch',
                        objectClass: 'groupOfNames',
                        cn: 'temp',
                        member: data.organizations.map(o => o.DN).join(';'),
                        owner: params.parent.DN,
                    });
                    mapDataToExistingCommunity(data, parentCommunity, this.findHighestCommunityID(parentCommunity) || 1);
                    
                    this.processLoadedData(data);
                });
                break;
            }
        },
        addOrg: function(params) {
            const MAX_DEPARTMENT_FOR_GRAPH = 99;
            const MAX_HP_FOR_GRAPH = 49;

            if (params.subOrganizations.length > MAX_DEPARTMENT_FOR_GRAPH || params.professionalsAmount > MAX_HP_FOR_GRAPH) {
                this.networkEnabled = false;
            }

            // close modal
            this.modalType = undefined;
            this.generating = true;

            generator.generateData({
                    amount: parseInt(params.professionalsAmount) || 1,
                    type: params.type,
                    national: this.national,
                    departments: params.subOrganizations
                }
            ).then((data) => {
                this.generating = false;
                this.processLoadedData(data);
                this.accordionExpanded.push(false);
                this.networkEnabled && network.network.stabilize();
            });
        },
        getTypeName: function(type) {
            if (!this.types) return '?'; // should not happen
            switch(type) {
                case 'group': 
                    return this.types.group[Math.floor(Math.random() * this.types.group.length)];
                case 'department':
                    return this.types.department[Math.floor(Math.random() * this.types.department.length)];
                default: return 'Abteilung';
            }
        },
        findHighestCommunityID: function(community) {
            let id = '0'
            Object.keys(this.lookupTable).forEach(key => {
                if (key.startsWith(community)) {
                    const itemID = key.split(community + ':')[1]?.split(',')[0];
                    if (itemID && itemID > id) {
                        id = itemID;
                    }
                }
            });
            return id;
        },
        generateType: function(type) {
            generator.generateData({
                amount: 3,
                type: type,
                national: this.national
            }).then((data) => {
                this.processLoadedData(data);
            
                this.accordionExpanded.push(false);
                network.network.stabilize();
            });
        },
        setTab: function(index) {
            this.activeTab = index;
        },       
        toggleOrgInfoModal: function(org) {
            this.modalOrganization = org;
        },
        toggleAddModal: function(type) {
            this.modalType = type;
        },
        toggleAccordion: function(index) {
            this.accordionExpanded[index] = !this.accordionExpanded[index]
            this.$forceUpdate();
        },
        getPeerType: function(organization) {
            const peerProfessional = this.generatedData.professionals.find(item => item.DN === organization.members[0]);
            if (!peerProfessional) {
                const peerOrganization = this.generatedData.organizations.find(item => item.DN === organization.members[0]);
                if (this.types?.group.includes(peerOrganization.HcRegisteredName.split(' ').at(-1))) {
                    return 'group';
                }
                return 'department';
            }
            return peerProfessional.title 
                ? 'doctor'
                : 'caregiver';
        }
    },
    computed: {
        topLevelOrganizations() {
            // according to https://www.bag.admin.ch/dam/bag/de/dokumente/nat-gesundheitsstrategien/strategie-ehealth/gesetzgebung-elektronisches-patientendossier/gesetze/anhang_3_epdv_edi_ausgabe_3.pdf.download.pdf/EPDV-EDI_Anhang_3_DE_Ausgabe_3.pdf
            const TOP_LEVEL_ORGS = [
                'BAG:2.16.840.1.113883.6.96:722171005:Diagnostic institution',
                'BAG:2.16.840.1.113883.6.96:225728007:Accident and Emergency department',
                'BAG:2.16.840.1.113883.6.96:394747008:Health Authority',
                'BAG:2.16.840.1.113883.6.96:66280005:Private home-based care',
                'BAG:2.16.840.1.113883.6.96:22232009:Hospital',
                'BAG:2.16.840.1.113883.6.96:722172003:Military health institution',
                'BAG:2.16.840.1.113883.6.96:722173008:Prison based care site',
                'BAG:2.16.840.1.113883.6.96:42665001:Nursing home (environment)',
                'BAG:2.16.840.1.113883.6.96:264372000:Pharmacy',
                'BAG:2.16.840.1.113883.6.96:35971002:Ambulatory care site',
                'BAG:2.16.840.1.113883.6.96:80522000 Rehabilitation hospital',
                'BAG:2.16.840.1.113883.6.96:394778007:Client\'s or patient\'s home',
                'BAG:2.16.840.1.113883.6.96:288565001:Medical center',
                'BAG:2.16.840.1.113883.6.96:264358009:General practice premises',
                'BAG:2.16.840.1.113883.6.96:43741000:Site of care'
            ];
            return this.generatedData.organizations.filter(o => TOP_LEVEL_ORGS.includes(o.businessCategory));
        },
        footerString() {
            return '© Berner Fachhochschule 2021-2024 | Version ' + pkgjson.version;
        }
    }
};
</script>

<template>
  <div id="wrapper" v-if="types">
        <div class="d-flex flex-column" id="content-wrapper">
            <div class="mt-3" id="content">
                <div class="container-fluid ">
                    <div class="row">
                        <!-- SIDE NAV-->
                        <div class="col-xl-4 col-md-4 mb-2">
                            <div class="card shadow mb-4">
                                <div class="card-header py-3">
                                    <h3 class="m-0 font-weight-bold text-primary">HPD Testdaten Generator</h3>
                                </div>
                                <div class="card-body">
                                    <div class="row ">
                                        <div class="col-lg-12 ">
                                           <h4>Einstellungen</h4>
                                            <div class="form-row">
                                                <div class="col-12 mt-3">
                                                    <div class="form-check form-switch">
                                                        <input checked class="form-check-input"
                                                               id="flexSwitchCheckChecked"
                                                               type="checkbox"
                                                               v-model="national">
                                                        <label class="form-check-label" for="flexSwitchCheckChecked">
                                                            National HPD</label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="row mt-3 side-menu">

                                        <h3>Organisationen</h3>
                                        <div class="col-lg-12  " v-for="button in organizationButtons">

                                            <button class="btn btn-primary mb-3 add-button left-half-button"
                                                    @click="generateType(button.type)"
                                                    :disabled="generating || processing">
                                                <i aria-hidden="true"
                                                   :class="'fa ' + button.icon"></i>
                                                {{ button.label }}
                                            </button>
                                            <button class="btn btn-info btn-block mb-3 settings-button right-half-button" 
                                                    @click="toggleAddModal(button)"
                                                    :disabled="generating || processing">
                                                <i aria-hidden="true" class="fa fa-gears adjust-button"></i>
                                            </button>
                                        </div>

                                        <!--h3>Gesundheitsfachpersonen</h3>
                                        <div class="col-lg-12  " v-for="button in professionalButtons">
                                            <button class="btn btn-primary mb-3 add-button left-half-button"
                                                    v-on:click="generateType(button.type)">
                                                <i aria-hidden="true"
                                                   v-bind:class="'fa ' + button.icon"></i>
                                                {{ button.label }}
                                            </button>
                                            <button class="btn btn-info btn-block mb-3 settings-button right-half-button">
                                                <i aria-hidden="true" class="fa fa-gears adjust-button"></i>
                                            </button>
                                        </div-->
                                        
                                        <div class="col-lg-12 mt-3" v-if="counter > 1">

                                            <h3>Herunterladen</h3>
                                            <div class="d-grid gap-2">
                                                <button class="btn btn-lg btn-success"
                                                        @click="download('/output/all.zip')">
                                                    <i class="fa fa-download"></i>
                                                    Herunterladen
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-xl-8     col-md-8">
                            <ul class="nav nav-tabs">
                                <li class="nav-item" :class="{'reduced-opacity': i == 0 && !networkEnabled}" v-for="(tab, i) in tabs" v-on:click="setTab(i)">
                                  <a v-bind:class="{'nav-link': true, active: activeTab == i, shadow: activeTab == i}" href="#">{{tab}}</a>
                                </li>
                              </ul>
                            <organization-detail-modal v-if="modalOrganization" v-bind:organization="modalOrganization" @close="toggleOrgInfoModal()"></organization-detail-modal>
                            <add-org-modal v-if="modalType" :type="modalType" :types="types" @close="toggleAddModal()" @add="(e) => addOrg(e)"></add-org-modal>
                            <!-- NETWORK TAB-->
                            <div class="shadow card" :class="{hidden: activeTab != 0, 'reduced-opacity': !networkEnabled}"> <!-- switch tabs via CSS, so the network does not get lost-->
                                <div class="loading-spinner" v-if="counter == 0">
                                    <div class="spinner-border" role="status">
                                        <span class="visually-hidden">Lädt...</span>
                                    </div>
                                </div>
                                <div class="col-12 d-grid gap-2" v-if="networkEnabled">
                                    <div id="mynetwork"></div>
                                    <div class="form-check form-switch hierachical-switch">
                                        <input class="form-check-input"
                                            id="hierarchicalSwitch"
                                            type="checkbox"
                                            v-model="hierarchicalView"
                                            v-on:click="toggleHierarchical()">
                                        <label class="form-check-label" for="hierarchicalSwitch">
                                            Hierarchical view
                                        </label>
                                    </div>
                                </div>
                                <div v-else class="alert alert-primary" role="alert">
                                    Die grafische Darstellung ist bei grossen Datenmengen aus Performance-Gründen deaktiviert.
                                </div>
                            </div>
                            <!-- ACCORDION TAB-->
                            <div class="shadow card" v-bind:class="{hidden: activeTab != 1}">
                                <div class="accordion" id="accordionExample">
                                    <div class="accordion-item" v-for="(org, index) in topLevelOrganizations">
                                      <h2 class="accordion-header" v-on:click="toggleAccordion(index)">
                                        <button class="accordion-button" v-bind:class="{collapsed: !accordionExpanded[index]}" type="button" data-bs-toggle="collapse" v-bind:data-bs-target="'#collapse'+index" v-bind:aria-expanded="accordionExpanded[index]" v-bind:aria-controls="'collapse'+index ">
                                          {{ org.HcRegisteredName }}
                                          <i aria-hidden="true" class="fa fa-info-circle info-button" @click.stop="toggleOrgInfoModal(org)"></i>
                                        </button>
                                      </h2>
                                        <div v-bind:id="'collapse'+index" class="accordion-collapse collapse" v-bind:class="{show: accordionExpanded[index]}">
                                        <div class="accordion-body"> 
                                            <sub-organization-list v-bind:organization="org" v-bind:data="generatedData" @selectorg="(o) => toggleOrgInfoModal(o)" @add="add"></sub-organization-list>
                                        </div>
                                      </div>
                                    </div>
                                    <div class="accordion-item processing-hint" v-if="processing || generating">
                                      <h2 class="accordion-header">
                                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse">
                                          <span class="processing-text">{{processing ? 'Daten werden verknüpft' : 'Daten werden generiert'}}</span>
                                        </button>
                                      </h2>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <footer class="sticky-footer bg-white">
                <div class="container my-auto">
                    <div class="copyright text-center my-auto">
                        <span>{{ footerString }}</span>
                    </div>
                </div>
            </footer>
        </div>
    </div>
    <div class="alert alert-warning" style="margin: 4em" role="alert" v-else-if="prepareError">
        {{prepareError}}
    </div>
    <div class="loading-spinner" v-else>
        <div class="spinner-border" role="status">
            <span class="visually-hidden">Lädt...</span>
        </div>
    </div>
</template>

<style>

#mynetwork {
    width: 100%;
    height: calc(100vh - 200px);
    border: 1px solid lightgray;
    background: #fff;
}

#app {
    display: block !important; 
    max-width: 2000px !important;
}

body {
    place-items: unset !important;
    background-color: white;
}

.item-align-top {
    align-self: self-start;
    padding-top: 4px;
}

footer.sticky-footer {
    padding: 1rem 0;
}


.pushable {
    position: relative;
    border: none;
    background: transparent;
    padding: 0;
    cursor: pointer;
    outline-offset: 4px;
    transition: filter 250ms;
    display: block;
    width: 100%;
}

.button-shadow {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 10px;
    background: hsl(0deg 0% 0% / 0.25);
    will-change: transform;
    transform: translateY(2px);
    transition: transform 600ms cubic-bezier(.3, .7, .4, 1);
}

.edge {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 10px;
    background: linear-gradient(to left,
    #4e73df 0%,
    #3f5ebe 8%,
    #3f5ebe 92%,
    #4e73df 100%
    );
}

.front {
    display: block;
    position: relative;
    padding: 5px 12px;
    border-radius: 10px;
    font-size: 1.25rem;
    color: white;
    background: #4e73df;
    will-change: transform;
    transform: translateY(-4px);
    transition: transform 600ms cubic-bezier(.3, .7, .4, 1);
}

.pushable:hover {
    filter: brightness(110%);
}

.pushable:hover .front {
    transform: translateY(-6px);
    transition: transform 250ms cubic-bezier(.3, .7, .4, 1.5);
}

.pushable:active .front {
    transform: translateY(-2px);
    transition: transform 34ms;
}

.pushable:hover .shadow {
    transform: translateY(4px);
    transition: transform 250ms cubic-bezier(.3, .7, .4, 1.5);
}

.pushable:active .shadow {
    transform: translateY(1px);
    transition: transform 34ms;
}

.pushable:focus:not(:focus-visible) {
    outline: none;
}

.pushable.small .front {
    padding: 3px 11px;
    font-size: 16px;
}

.pushable-green .front {
    background: #0f6848;
}

h3 {
    font-size: 18px;
    font-weight: bold;
    color: #333;
    margin-bottom: 15px;
}

.loading-spinner {
    position: absolute;
    left:50%;
    top:50%;
    transform: translate(-50%,-50%) scale(5,5);
}

.nav-item {
    margin-left: 0.5em;
}

.nav-tabs {
    border-bottom: 0px !important;
}

.hidden {
    display: none;
}

.table, .accordion {
    margin: 1em;
    width: unset;
}

.sub-table {
    margin: 0;
}
.hierachical-switch {
    margin: 0.5em;
}

.accordion-body {
    overflow-x: scroll;
    padding: 0;
}

.accordion-button {
    border-left: 2px #EAF4F8 solid;
    border-top-left-radius: 0 !important;
    border-bottom-left-radius: 0 !important;
}

.sub-org-header {
    padding: 0 !important;
}x

.info-row {
    font-size: 0.85rem;
}

.add-button {
    width: 75%;
}
.settings-button {
    width: 20%;
}
.org-list {
    list-style-type: none;
}

.professional-button {
    border-left: 2px #EAF4F8 solid !important;
    border-top-left-radius: 0 !important;
    border-bottom-left-radius: 0 !important;
    cursor: pointer;
    position: relative;
    display: -ms-flexbox;
    display: flex;
    -ms-flex-align: center;
    align-items: center;
    width: 100%;
    padding: 1rem 1.25rem;
    font-size: 1rem;
    color: #222;
    text-align: left;
    background-color: #fff;
    border: 0;
    border-radius: 0;
    overflow-anchor: none;
}

.add-entry {
    opacity: 0.5;
}
.add-entry:hover {
    opacity: 1;
}

.modal-body {
    overflow: scroll;
}

.modal-dialog {
    max-width: 900px;
}

.modal-background {
    background-color: black;
    opacity: 0.2;
    position: absolute;
    width: 100%;
    height: 100%;
}

.info-button {
    font-size: 1.2em;
    margin-left: 0.5em;
    opacity: 0.5;
}

.info-button:hover {
    opacity: 1;
}

.modal-title  i {
    margin-right: 0.5em;
}
.sub-org-list {
    list-style-type: none;
    padding: 0;
    max-height: 60vh;
    overflow: scroll;
}

.sub-org-list li {
    display: inline-block;
    background-color: aliceblue;
    height: 2rem;
    padding: 0.2em;
    padding-left: 0.8em;
    margin-left: 1em;
    margin-bottom: 0.4em;
    border-radius: 1em;
    padding-right: 0.5em;
}

.gfp-form-row {
    margin-top: 1em;
    display: block ruby;
    margin-left: 0.8em;
}

.add-sub-org-button input, .gfp-form-row input {
    width: 5em;
    display: unset;
    margin-right: 0.5em;
}

.accordion-body {
    max-height: 66vh;
}

.alert {
    margin: 1.5em;
    border: 0;
}

.reduced-opacity {
    opacity: 0.5;
}

.right-half-button {
  border-bottom-left-radius: 0;
  border-top-left-radius: 0;
  height: calc(100% - 16px);
}
.left-half-button {
  border-bottom-right-radius: 0;
  border-top-right-radius: 0;
}

.processing-hint .accordion-button {
  cursor: progress !important;
  background-color: #EAF4F8;
}
.processing-hint .accordion-button::after {
  background-image: none !important;
}
@keyframes dots {  
  0% { content: ''; }
  25% { content: '.'; }
  50% { content: '..';}
  75% { content: '...'; }
}
@-webkit-keyframes dots {  
  0% { content: ''; }
  25% { content: '.'; }
  50% { content: '..';}
  75% { content: '...'; }
}
.processing-text:after {
  content: '';
  -webkit-animation-name: dots;  
  -webkit-animation-iteration-count: infinite;  
  -webkit-animation-duration: 2s; 
  animation-name: dots;  
  animation-iteration-count: infinite;  
  animation-duration: 2s; 
}
</style>
