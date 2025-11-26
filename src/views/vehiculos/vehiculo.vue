<template>
    <v-row>
        <v-col cols="12">
            <v-card flat>
                <v-card-title class="text-h5">
                    <v-row>
                        <v-col cols="11">
                            Vehiculo:
                        </v-col>
                        <v-col cols="1" class="d-flex justify-end">
                            <v-btn variant="text" density="compact" color="blue" icon="mdi-arrow-left" @click="router.back()" title="volver"></v-btn>
                        </v-col>
                    </v-row>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <v-row>
                            <v-col cols="4">
                                <v-text-field label="Marca" variant="outlined" readonly v-model="vehicle.brand"></v-text-field>
                            </v-col>
                            <v-col cols="4">
                                <v-text-field label="Modelo" variant="outlined" readonly v-model="vehicle.model"></v-text-field>
                            </v-col>
                            <v-col cols="4">
                                <v-text-field label="Año" variant="outlined" readonly v-model="vehicle.year"></v-text-field>
                            </v-col>
                            <v-col cols="4">
                                <v-text-field label="Patente" variant="outlined" readonly v-model="vehicle.patent"></v-text-field>
                            </v-col>
                            <v-col cols="4">
                                <v-text-field label="Kilometraje" variant="outlined" readonly v-model="vehicle.mileage"></v-text-field>
                            </v-col>
                            <v-col cols="4">
                                <v-text-field label="Fecha de registro" variant="outlined" readonly v-model="vehicle.register_date"></v-text-field>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-card-text>
            </v-card>
        </v-col>
        <v-col cols="12">
            <v-card flat>
                <v-card-title class="text-h5">
                    <v-row>
                        <v-col cols="12">
                            Cliente asociado:
                        </v-col>
                    </v-row>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <v-row>
                            <v-col cols="3">
                                <v-text-field label="Nombre" variant="outlined" readonly v-model="client.name"></v-text-field>
                            </v-col>
                            <v-col cols="3">
                                <v-text-field label="Apellido" variant="outlined" readonly v-model="client.lastname"></v-text-field>
                            </v-col>
                            <v-col cols="3">
                                <v-text-field label="Telefono" variant="outlined" readonly v-model="client.phone"></v-text-field>
                            </v-col>
                            <v-col cols="3">
                                <v-text-field label="Email" variant="outlined" readonly v-model="client.email"></v-text-field>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-card-text>
            </v-card>
        </v-col>
        <v-col cols="12">
            <v-data-table
                :items = "diagnoses"
                :headers = "headersDiagnoses"
                :search = "searchDiagnoses"
            >
                <template v-slot:top>
                    <v-toolbar flat>
                        <v-toolbar-title>
                            <v-row>
                                <v-col cols="9">
                                    <v-icon color="medium-emphasis" icon="mdi-pen" size="x-small"></v-icon>
                                    Diagnosticos realizados
                                </v-col>
                                <v-col cols="3" class="d-flex justify-end">
                                    <v-text-field
                                        class="me-2"
                                        density="compact"
                                        hide-details
                                        variant="outlined"
                                        prepend-inner-icon="mdi-magnify"
                                        placeholder="Buscar"
                                        v-model="searchDiagnoses"
                                        clearable
                                    ></v-text-field>
                                </v-col>
                            </v-row>
                        </v-toolbar-title>
                    </v-toolbar>
                </template>
                    
                <template v-slot:item.state="{ item }">
                    {{ item.state>0?'Solucionado':'Sin solucionar' }}
                </template>

                <template v-slot:item.register_date="{ item }">
                    {{ convertDate(item.register_date).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" }) }}
                </template>

                <template v-slot:item.description="{ item }">
                    <v-textarea readonly v-model="item.description"></v-textarea>
                </template>
            </v-data-table>
        </v-col>
        <v-col cols="12">
            <v-data-table
                :items="budgets"
                :headers="headersBudgets" 
                :search="searchBudgets"
            >
                <template v-slot:top>
                    <v-toolbar flat>
                        <v-toolbar-title>
                            <v-row>
                                <v-col cols="9">
                                    <v-icon color="medium-emphasis" icon="mdi-invoice-list" size="x-small"></v-icon>
                                    Presupuestos realizados
                                </v-col>
                                <v-col cols="3" class="d-flex justify-end">
                                    <v-text-field
                                        class="me-2"
                                        density="compact"
                                        hide-details
                                        variant="outlined"
                                        prepend-inner-icon="mdi-magnify"
                                        placeholder="Buscar"
                                        v-model="searchBudgets"
                                        clearable
                                    ></v-text-field>
                                </v-col>
                            </v-row>
                        </v-toolbar-title>
                    </v-toolbar>
                </template>

                <template v-slot:item.date="{ item }">
                    {{ convertDate(item.date).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" }) }}
                </template>

                <template v-slot:item.total="{ item }">
                    $ {{ item.total }}
                </template>

                <template v-slot:item.actions="{ item }">
                    <v-btn variant="text" density="compact" color="grey" icon="mdi-eye" @click="router.push({name: 'presupuesto', params: {id: item.id}})" title="ver detalles"></v-btn>
                </template>

            </v-data-table>
        </v-col>
    </v-row>
</template>
<script setup>
    import GeneralService from "@/services/GeneralService.js";
    import { onMounted, ref } from 'vue';
    import { convertDate } from "@/utilities/utilities.js";
    import { useRoute, useRouter } from 'vue-router';
    
    const router = useRouter();
    const route = useRoute();

    const vehicleID = ref ();
    const vehicle = ref([]);
    const client = ref([]);
    const budgets = ref([]);
    const headersBudgets = ref([
        { title: 'N° Recibo', align: 'end', key: 'number' },
        { title: 'Marca', key: 'brand' },
        { title: 'Modelo', key: 'model' },
        { title: 'Patente', key: 'patent' },
        { title: 'Año', align: 'end', key: 'year' },
        { title: 'Fecha', align: 'end', key: 'date'},
        { title: 'Total', align: 'end', key: 'total' },
        { title: 'Acciones', align: 'center', key: 'actions', sortable: false },
    ]);
    const searchBudgets = ref("");
    const diagnoses = ref([]);
    const headersDiagnoses = ref([
        { title: 'Estado', key: 'state' },
        { title: 'Descripción', key: 'description' },
        { title: 'Marca', key: 'brand' },
        { title: 'Modelo', key: 'model' },
        { title: 'Fecha de registro', align: 'end', key: 'register_date'},
    ]);
    const searchDiagnoses = ref();

    onMounted(async () => {
        if (route.params.id>0 && /^-?\d+$/.test(route.params.id)) {
            vehicleID.value = route.params.id;
            index();
        }else{
            router.back();
        }
    });

    function index () {
        GeneralService.vehicleShow(vehicleID.value).then((response) => {
            if (Object.keys(response.data).length === 0) {
                router.back();
            }else{
                vehicle.value = response.data;
                vehicle.value.register_date = convertDate(vehicle.value.register_date).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });

                GeneralService.clientShow(vehicle.value.client_id).then((response) => {
                    client.value = response.data
                });
                GeneralService.vehiclePayments(vehicleID.value).then((response)=> {
                    budgets.value = response.data
                });
                GeneralService.vehicleDiagnoses(vehicleID.value).then((response) => {
                    diagnoses.value = Object.keys(response.data).length === 0?[]:response.data;
                });
            }
        });
    }
</script>