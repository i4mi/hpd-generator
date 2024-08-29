<script>
function getSuborgNames(already, available, amount) {
    let selected = [...already];
    if (already.length < 1000) {
        for (let i = 0; i < amount; i++) {
            let initial = available[Math.floor(Math.random() * available.length)];
            let additionalNumber = 2;
            let suborg = initial;
            while ([...already, ...selected].includes(suborg)) {
                suborg = initial + ' ' + additionalNumber;
                additionalNumber++;
            }
            selected.push(suborg);
        }
    } else {
        for (let i = 0; i < amount; i++) {
            selected.push(available[Math.floor(Math.random() * available.length)] + ' (' + Math.random().toString(16).slice(2,8) +')');
        }
    }
    return selected;
};

export default {
    name: 'AddOrgModal',
    data() {
        return {
            loading: false,
            subOrganizations: [],
            subOrgType: undefined,
            departmentsAmount: 1,
            professionalsAmount: 3
      }
    },
    props: {
        type: Object,
        types: Object
    },
    mounted() {
        switch(this.type?.type) {
            case 'doctoroffice': 
            case 'hospital':
                this.subOrganizations = this.types.group.slice(0,2);
                this.subOrgType = 'group';
                break;
            case 'reha':
                this.subOrganizations = this.types.group.slice(0,3);
                this.subOrgType = 'group';
                break;
            case 'ambulant':
                this.subOrganizations = [...this.types.group];
                this.subOrgType = 'group';
                break;
            case 'radiology':
                this.subOrganizations = ['Ärzte', 'Radiologie-Assistenten', 'Praxisassistenten'];
                this.subOrgType = 'group';
                break;
            case 'universityhospital':
                this.subOrgType = 'department';
                this.subOrganizations = [...this.types.department].sort(() => 0.5 - Math.random()).slice(0,4); // get 4 random elements       
                break;
            case 'bighospital':
                this.subOrgType = 'department';
                this.subOrganizations = ['Arztpraxis', 'Medizin', 'Chirurgie'];
                break;
            default:
                this.subOrgType = 'department';
                this.subOrganizations = [...this.types.department].sort(() => 0.5 - Math.random()).slice(0,3); // get 3 random elements       
        }
    },
    methods: {
        close() {
            this.$emit('close');
        },
        add() {
            this.$emit('add', {
                type: this.type.type,
                subOrganizations: this.subOrganizations,
                professionalsAmount: this.professionalsAmount
            });
        },
        addSuborganizations() {
            this.subOrganizations = getSuborgNames(this.subOrganizations, this.types[this.subOrgType], this.departmentsAmount);
        },
    },
    watch: {
        departmentsAmount(n) {
            if (n > 1000) {
                this.departmentsAmount = 1000;
            }
        },
        professionalsAmount(n) {
            if (n > 500) {
                this.professionalsAmount = 500;
            }
        }
    }
}
</script>

<template>
    <div class="modal" style="display: unset" >
        <div class="modal-background"></div>
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title"><i aria-hidden="true" :class="'fa ' + type.icon" ></i>{{ type.label }} hinzufügen</h5>
                    <button type="button" class="btn-close" @click="close()" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form>
                        <div class="mb-3">
                            <h3>Sub-Organisationen</h3>
                            <ul class="sub-org-list">
                                <li v-for="(chip, i) in subOrganizations">
                                    <span>{{chip}} </span><span style="opacity: 0.5; cursor:pointer" @click="subOrganizations.splice(i,1)">⊗</span>
                                </li>
                            </ul>
                            <button type="button" class="btn btn-secondary add-sub-org-button" style="text-transform: none;" @click.stop="addSuborganizations">
                                <input class="form-control" type="number" v-model="departmentsAmount" min="1" max="1000" @click.stop=""></input> weitere Sub-Organisation{{ departmentsAmount > 1 ? 'en' : ''}} hinzufügen
                            </button>
                            <div class="gfp-form-row"><input class="form-control" type="number" max="500" v-model="professionalsAmount" min="1" />&nbspGesundheitsfachperson pro Sub-Organisation</div>
                        </div> 
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" @click="close()">Abbrechen</button>
                    <button type="submit" class="btn btn-primary" @click="add()">{{ type.label }} hinzufügen</button>
                  </div>
            </div>  
        </div>
    </div>
</template>

<style scoped></style>
