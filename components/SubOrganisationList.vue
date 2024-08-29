<script>
export default {
    name: 'SubOrganisationList',

    data() {
        return {   
            subOrgsExpanded: [],
            professionalsExpanded: []
        }
    },
    props: {
        organization: Object,
        data: Object
    },
    mounted() {
        this.subOrgsExpanded = this.getSuborganizations(this.organization).map(() => false);
        this.professionalsExpanded = this.getProfessionals(this.organization).map(() => false);
    },
    methods: {
        getSuborganizations(owner) {
            return this.data.organizations.filter(item => owner.members?.includes(item.DN));
        },
        getProfessionals(owner) {
            return this.data.professionals.filter(item => owner.members?.includes(item.DN));
        },
        toggleSubOrgExpanded(index) {
            this.subOrgsExpanded[index] = !this.subOrgsExpanded[index];
            this.$forceUpdate();
        },
        toggleProfessionalExpanded(index) {
            this.professionalsExpanded[index] = !this.professionalsExpanded[index];
            this.$forceUpdate();
        }
    }
}
</script>

<template>
     <ul class="org-list">
        <li v-for="(subOrg, index) in getSuborganizations(organization)">
            <button type="button" class="accordion-button" v-bind:class="{collapsed: !subOrgsExpanded[index]}" v-on:click="toggleSubOrgExpanded(index)" v-bind:aria-expanded="subOrgsExpanded[index]">
                {{ subOrg.HcRegisteredName }}
                <i aria-hidden="true" class="fa fa-info-circle info-button" @click.stop="$emit('selectorg', subOrg)"></i>
            </button>
            <div v-if="subOrgsExpanded[index]">
                <SubOrganisationList v-bind:organization="subOrg" v-bind:data="data" @selectorg="(e) => $emit('selectorg', e)" @add="(e) => $emit('add', e)"></SubOrganisationList>
            </div>
        </li>
        <li v-if="getSuborganizations(organization).length > 0">
            <button type="button" class="professional-button add-entry" @click.stop="$emit('add', {parent: organization})">
                <i aria-hidden="true" class="fa fa-plus"></i>&nbsp;Abteilung hinzufügen 
            </button>
        </li>
        

        <li v-for="(professional, index) in getProfessionals(organization)">
            <button type="button" class="professional-button" >
            {{ professional.displayName }}
            <i aria-hidden="true" class="fa fa-info-circle info-button" @click.stop="$emit('selectorg', professional)"></i>
        </button>
        </li>
        <li v-if="getProfessionals(organization).length > 0">
            <button type="button" class="professional-button add-entry" @click.stop="$emit('add', {parent: organization})">
                <i aria-hidden="true" class="fa fa-plus"></i>&nbsp;Gesundheitsfachperson hinzufügen
            </button>
        </li>
    </ul>
</template>

<style scoped></style>
