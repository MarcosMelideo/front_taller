<template>
    <v-row>
        <v-col cols="12" v-if="!print.value">
            <v-card flat>
                <v-card-title class="d-flex justify-end">
                    <v-btn variant="text" density="compact" icon="mdi-printer" @click="imprimir()" title="imprimir"></v-btn>
                    <v-btn variant="text" density="compact" color="blue" icon="mdi-arrow-left" @click="router.back()" title="volver"></v-btn>
                </v-card-title>
            </v-card>
        </v-col>
        <v-col cols="12">    
            <v-data-table 
                :headers="headersBudget" 
                :items="budget"
                :hide-default-footer="true"
                :header-props="{ sortIcon: null }"
                disable-sort
            >
                <template v-slot:top>
                    <v-toolbar flat>
                        <v-toolbar-title>
                            <v-row>
                                <v-col cols="8">
                                    Presupuesto N° {{ budgetNumber }}
                                </v-col>
                                <v-col cols="4" class="d-flex justify-end">
                                    <v-text-field
                                        class="me-2 center-text"
                                        density="compact"
                                        hide-details
                                        variant="outlined"
                                        prepend-inner-icon="mdi-calendar"
                                        readonly
                                        v-model="budgetDate"
                                    ></v-text-field>
                                </v-col>
                            </v-row>
                        </v-toolbar-title>
                    </v-toolbar>
                </template>

                <template v-slot:item.client_name="{ item }">
                    {{ item.client_name+' '+item.client_lastname }}
                </template>

            </v-data-table>
        </v-col>
        <v-col cols="12">
            <v-data-table 
                :headers="headersItems" 
                :items="budgetItems"
                :search="search"
                :hide-default-footer="print.value"
                :disable-sort="print.value"
            >

                <template v-slot:top>
                    <v-toolbar flat>
                        <v-toolbar-title>
                            <v-row>
                                <v-col cols="9">
                                    Detalles de presupuesto
                                </v-col>
                                <v-col cols="3" class="d-flex justify-end">
                                    <v-text-field
                                        v-if="!print.value"
                                        class="me-2"
                                        density="compact"
                                        hide-details
                                        variant="outlined"
                                        prepend-inner-icon="mdi-magnify"
                                        placeholder="Buscar"
                                        v-model="search"
                                        clearable
                                    ></v-text-field>
                                </v-col>
                            </v-row>
                        </v-toolbar-title>
                    </v-toolbar>
                </template>

                <template v-slot:item.price_by_unit="{ item }">
                    $ {{ item.price_by_unit }}
                </template>

                <template v-slot:item.subtotal="{ item }">
                    $ {{ item.subtotal }}
                </template>
            </v-data-table>
        </v-col>
        <v-col cols="12" class="d-flex justify-end">
            <v-card title="Total" flat>
                <v-card-text>
                    <v-text-field class="right-text" type="number" density="compact" hide-details variant="outlined" prefix="$" readonly v-model="budgetTotal"></v-text-field>
                </v-card-text>
            </v-card>
        </v-col>
    </v-row>
</template>

<script setup>
    import GeneralService from "@/services/GeneralService.js";
    import { onMounted, ref } from 'vue';
    import { useRoute, useRouter } from 'vue-router';
    import { convertDate } from "@/utilities/utilities.js";
    import { usePrintState } from "@/stores/store.js"
    import { useTheme } from 'vuetify'
    
    const theme = useTheme()
    const print = usePrintState();
    const router = useRouter();
    const route = useRoute();

    const budgetID = ref();
    const budget = ref([]);
    const headersBudget = ref([
        { title: 'cliente', key: 'client_name' },
        { title: 'marca', key: 'brand' },
        { title: 'modelo', key: 'model' },
        { title: 'año', aling: 'end', key: 'year' },
        { title: 'kilometraje', aling: 'end', key: 'mileage' },
        { title: 'patente', key: 'patent' },
    ]);
    const budgetNumber = ref();
    const budgetDate = ref();
    const budgetTotal = ref();
    const budgetItems = ref([]);
    const headersItems = ref([
        { title: 'Concepto', key: 'concept' },
        { title: 'Descripción', key: 'description' },
        { title: 'Cantidad', align: 'end', key: 'quantity' },
        { title: 'Precio Unitario', align: 'end', key: 'price_by_unit' },
        { title: 'Subtotal', align: 'end', key: 'subtotal' },
    ]);
    const search = ref("");

    onMounted(async () => {
        if (route.params.id>0 && /^-?\d+$/.test(route.params.id)) {
            budgetID.value = route.params.id;
            if (route.params.imprimir==='imprimir') {
                print.changePrintState(true);
                if (theme.name.value === "dark")theme.toggle();
            }
            index();
        }else{
            router.back();
        }
    });

    function index () {
        GeneralService.paymentShow(budgetID.value).then((response) => {
            if (Object.keys(response.data).length === 0) {
                router.back();
            }else{
                budget.value = response.data;
                budgetNumber.value = response.data[0].number;
                budgetDate.value = convertDate(budget.value[0].date).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
                budgetTotal.value = response.data[0].total;
                GeneralService.paymentShowItems(budgetID.value).then((response) => {
                    budgetItems.value = response.data;
                }).then(() => { if (route.params.imprimir==='imprimir') window.print(); });
            }
        });
    }

    function imprimir () {
        window.open(
            router.resolve({name: 'presupuesto', params: {imprimir: "imprimir", id: budgetID.value}}).href
        );
    }
</script>

<style scoped>
    .center-text >>> input {
      text-align: center
    }
    .right-text >>> input {
      text-align: right
    }
</style>