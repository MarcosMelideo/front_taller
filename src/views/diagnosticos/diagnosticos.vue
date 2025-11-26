<template>
    <v-sheet border>
        <v-data-table
            :items="diagnoses"
            :headers="headers"
            :search="search"
        >
            <template v-slot:top>
                <v-toolbar flat>
                    <v-toolbar-title>
                        <v-row>
                            <v-col cols="auto">
                                <v-icon color="medium-emphasis" icon="mdi-pen" size="x-small"></v-icon>
                                Diagnosticos
                            </v-col>
                            <v-col cols="auto">
                                <v-text-field
                                    width="200"
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

                    <v-btn
                        color="green"
                        class="me-2"
                        prepend-icon="mdi-plus"
                        text="Nuevo diagnostico"
                        border
                        @click="showDialog('Nuevo')"
                    ></v-btn>
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

            <template v-slot:item.actions="{ item }">
                <v-btn variant="text" density="compact" color="blue" icon="mdi-pencil" @click="showDialog('Editar', item)" title="editar"></v-btn>
                <v-btn variant="text" density="compact" color="red" icon="mdi-delete" @click="showDialog('Eliminar', item)" title="eliminar"></v-btn>
            </template>
        </v-data-table>
    </v-sheet>

    <v-dialog v-model="dialog" max-width="500" persistent>
        <v-card
            :title="`${dialogTitle} diagnostico`"
            :subtitle="`${isDeleting? '¿Seguro que quiere Desactivar?' : ''}`"
        >
            <template v-slot:text>
                <v-form refs="form" v-model="validData">
                    <v-row>
                        <v-col cols="6">
                            <v-autocomplete
                                variant="outlined"
                                label="vehiculo"
                                :items="vehicles"
                                item-title="vehicle_name"
                                return-object
                                v-model="vehicle"
                                :rules="rulesVehicle"
                                :error="errorVehicle"
                                :error-messages="msgVehicle"
                                :disabled="isDeleting"
                                @update:modelValue="vehicle?.client_name != null?diagnosis.client_name = vehicle.client_name : diagnosis.client_name = ''"
                            >
                            </v-autocomplete>
                        </v-col>
                        <v-col cols="6">
                            <v-text-field :disabled="isDeleting" readonly  v-model="diagnosis.client_name " label="Nombre" variant="outlined"></v-text-field>
                        </v-col>
                        <v-col cols="6">
                            <v-date-input :disabled="isDeleting" v-model="diagnosis.register_date" :rules="rulesDate" label="Fecha de registro" variant="outlined"></v-date-input>
                        </v-col>
                        <v-col cols="6">
                            <v-select
                                variant="outlined"
                                label="Estado"
                                :items="states"
                                item-title="state"
                                item-value="value"
                                v-model="diagnosis.state"
                                :disabled="isDeleting"
                            ></v-select>
                        </v-col>
                        <v-col cols="12">
                            <v-textarea :disabled="isDeleting" v-model="diagnosis.description" :rules="rulesDescription" label="Descripcion"></v-textarea>
                        </v-col>
                    </v-row>
                </v-form>
            </template>

            <v-card-actions>
                <v-btn color="red" border text="Cancelar" @click="dialog = false"></v-btn>
                <v-btn color="green" border :text="`${isDeleting? 'Aceptar' : 'Guardar'}`" :disabled="!validData" @click="saveChanges(dialogTitle)"></v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script setup>
    import { onMounted, ref, shallowRef } from 'vue';
    import { VDateInput } from 'vuetify/labs/VDateInput';
    import GeneralService from "@/services/GeneralService.js";
    import Swal from "sweetalert2";
    import { useRouter } from 'vue-router';
    import { convertDate } from "@/utilities/utilities.js";

    const search = ref("");
    const diagnosis = ref([]);
    const diagnoses = ref([]);
    const headers = ref ([
        { title: 'Estado', key: 'state'},
        { title: 'Descripcion', key: 'description'},
        { title: 'Marca', key: 'brand' },
        { title: 'Modelo', key: 'model' },
        { title: 'Cliente', key: 'client_name'},
        { title: 'Fecha de registro', align: 'end', key: 'register_date'},
        { title: 'Acciones', align: 'center', key: 'actions', sortable: false },
    ]);
    const states = ref([
        { state: 'Solucionado', value: 1 },
        { state: 'Sin solucionar', value: 0 },
    ]);
    const vehicles =  ref([]);
    const vehicle = ref([]);
    const rulesVehicle = ref([
        v => !!v || 'Seleccione algun vehiculo.',
    ]);
    const errorVehicle = ref(false);
    const msgVehicle = ref("");
    const rulesDate = ref([
        v => !!v || 'Seleccione alguna fecha.',
    ]);
    const rulesDescription = ref([
        v => !!v || 'Detalle alguna descripción.',
    ]);
    const dialog = shallowRef(false);
    const dialogTitle = ref("");
    const isDeleting = shallowRef(false);
    const validData = shallowRef(false);

    onMounted(async () => {
        index();
    });

    function index () {
        GeneralService.vehicleIndex().then((response) => {
            vehicles.value = response.data;
        }).catch((error) => {
            Swal.fire({
                toast: true,
                position: 'top-right',
                icon: 'error',
                iconColor: '#FFFFFF',
                title: error.message,
                showConfirmButton: false,
                background: '#F44336',
                color: "#FFFFFF",
                showCloseButton: true
            });
        });
    
        GeneralService.diagnosisIndex().then((response) => {
            diagnoses.value = response.data;
        }).catch((error) => {
            Swal.fire({
                toast: true,
                position: 'top-right',
                icon: 'error',
                iconColor: '#FFFFFF',
                title: error.message,
                showConfirmButton: false,
                background: '#F44336',
                color: "#FFFFFF",
                showCloseButton: true
            });
        });
    }

    function showDialog(title, item) {
        isDeleting.value = false;
        dialog.value = true;
        dialogTitle.value = title;
        if (title == "Nuevo") {
            diagnosis.value = { 
                id: '',
                description: '',
                state: 0,
                brand: '',
                model: '',
                vehicle_id: '',
                client_name: '',
                client_id: '',
                register_date: new Date(),
                date_state: new Date().toISOString().split("T")[0], 
            };
        } else {
            diagnosis.value = Object.assign({}, item);
            vehicle.value = vehicles.value.find(v => v.id === diagnosis.value.vehicle_id)
            if (title == "Eliminar") {
                isDeleting.value = true;
            }
        }
    }

    function saveChanges (type) {
        switch (type) {
            case "Nuevo":
                diagnosis.value.register_date = new Date(diagnosis.value.register_date).toISOString().split("T")[0];
                diagnosis.value.brand = vehicle.value.brand;
                diagnosis.value.model = vehicle.value.model;
                diagnosis.value.vehicle_id = vehicle.value.id;
                diagnosis.value.client_id = vehicle.value.client_id;
                GeneralService.diagnosisStore(diagnosis.value).then((response) => {
                    dialog.value = false;
                    if (response.status == 201) {
                        index();
                        Swal.fire({
                            toast: true,
                            position: 'top-right',
                            icon: 'success',
                            iconColor: '#FFFFFF',
                            title: '¡Diagnostico registrado exitosamente!',
                            showConfirmButton: false,
                            timer: 2000,
                            timerProgressBar: true,
                            background: '#4CAF50',
                            color: "#FFFFFF",
                        })
                    }else {
                        Swal.fire({
                            toast: true,
                            position: 'top-right',
                            icon: 'error',
                            iconColor: '#FFFFFF',
                            title: 'Ocurrio un error, no se pudo realizar la operación',
                            showConfirmButton: false,
                            background: '#F44336',
                            color: "#FFFFFF",
                            showCloseButton: true
                        })
                    }
                }).catch((error) => {
                    dialog.value = false;
                    Swal.fire({
                        toast: true,
                        position: 'top-right',
                        icon: 'error',
                        iconColor: '#FFFFFF',
                        title: error.message,
                        showConfirmButton: false,
                        background: '#F44336',
                        color: "#FFFFFF",
                        showCloseButton: true
                    })
                });
            break;

            case "Editar":
                diagnosis.value.register_date = new Date(diagnosis.value.register_date).toISOString().split("T")[0];
                diagnosis.value.brand = vehicle.value.brand;
                diagnosis.value.model = vehicle.value.model;
                diagnosis.value.vehicle_id = vehicle.value.id;
                diagnosis.value.client_id = vehicle.value.client_id;
                diagnosis.value.date_state =  new Date().toISOString().split("T")[0];
                GeneralService.diagnosisUpdate(diagnosis.value, diagnosis.value.id).then((response) => {
                    dialog.value = false;
                    if (response.status == 200) {
                        index();
                        Swal.fire({
                            toast: true,
                            position: 'top-right',
                            icon: 'success',
                            iconColor: '#FFFFFF',
                            title: '¡Cliente editado con éxito!',
                            showConfirmButton: false,
                            timer: 2000,
                            timerProgressBar: true,
                            background: '#4CAF50',
                            color: "#FFFFFF",
                        })
                    }else {
                        Swal.fire({
                            toast: true,
                            position: 'top-right',
                            icon: 'error',
                            iconColor: '#FFFFFF',
                            title: 'Ocurrio un error, no se pudo realizar la operación',
                            showConfirmButton: false,
                            background: '#F44336',
                            color: "#FFFFFF",
                            showCloseButton: true
                        })
                    }

                }).catch((error) => {
                    dialog.value = false;
                    Swal.fire({
                        toast: true,
                        position: 'top-right',
                        icon: 'error',
                        iconColor: '#FFFFFF',
                        title: error.message,
                        showConfirmButton: false,
                        background: '#F44336',
                        color: "#FFFFFF",
                        showCloseButton: true
                    })
                })
            break;

            case "Eliminar":
                GeneralService.diagnosisDestroy(diagnosis.value.id).then((response) => {
                    dialog.value = false;
                    if (response.status == 200) {
                        index();
                        Swal.fire({
                            toast: true,
                            position: 'top-right',
                            icon: 'success',
                            iconColor: '#FFFFFF',
                            title: '¡Cliente desactivado con éxito!',
                            showConfirmButton: false,
                            timer: 2000,
                            timerProgressBar: true,
                            background: '#4CAF50',
                            color: "#FFFFFF",
                        });
                    }else {
                        Swal.fire({
                            toast: true,
                            position: 'top-right',
                            icon: 'error',
                            iconColor: '#FFFFFF',
                            title: 'Ocurrio un error, no se pudo realizar la operación',
                            showConfirmButton: false,
                            background: '#F44336',
                            color: "#FFFFFF",
                            showCloseButton: true
                        });
                    }
                }).catch((error) => {
                    dialog.value = false;
                    Swal.fire({
                        toast: true,
                        position: 'top-right',
                        icon: 'error',
                        iconColor: '#FFFFFF',
                        title: error.message,
                        showConfirmButton: false,
                        background: '#F44336',
                        color: "#FFFFFF",
                        showCloseButton: true
                    });
                });
            break;
        }
    }
</script>