<template>
    <v-sheet border>
        <v-data-table
            :items = "vehicles"
            :headers="headers"
            :search="search"
        >
            <template v-slot:top>
                <v-toolbar flat>
                    <v-toolbar-title>
                        <v-row>
                            <v-col cols="auto">
                                <v-icon color="medium-emphasis" icon="mdi-car" size="x-small"></v-icon>
                                Vehiculos
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
                        text="nuevo vehiculo"
                        border
                        @click="showDialog('Nuevo')"
                    ></v-btn>
                </v-toolbar>
            </template>

            <template v-slot:item.register_date="{ item }">
                {{ convertDate(item.register_date).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" }) }}
            </template>
            
            <template v-slot:item.actions="{ item }">
                <v-btn variant="text" density="compact" color="blue" icon="mdi-pencil" @click="showDialog('Editar', item)" title="editar"></v-btn>
                <v-btn variant="text" density="compact" color="red" icon="mdi-delete" @click="showDialog('Eliminar', item)" title="eliminar"></v-btn>
                <v-btn variant="text" density="compact" color="grey" icon="mdi-eye" @click="router.push({name: 'vehiculo', params: {id: item.id}})" title="ver detalles"></v-btn>
            </template>
        </v-data-table>
    </v-sheet>

    <v-dialog v-model="dialog" max-width="500" persistent>
        <v-card
            :title="`${dialogTitle} vehiculo`"
            :subtitle="`${isDeleting? '¿Seguro que quiere Desactivar?' : ''}`"
        >
            <template v-slot:text>
                <v-form refs="form" v-model="validData">
                    <v-row>
                        <v-col cols="12" sm="6" md="6">
                            <v-text-field :disabled="isDeleting" v-model="vehicle.brand" :rules="ruleRequired" label="Marca" variant="outlined"></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6" md="6">
                            <v-text-field :disabled="isDeleting" v-model="vehicle.model" :rules="ruleRequired" label="Modelo" variant="outlined"></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6" md="6">
                            <v-text-field type="number" :disabled="isDeleting" v-model="vehicle.year" :rules="rulesYear" label="Año" variant="outlined"></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6" md="6">
                            <v-text-field :disabled="isDeleting" v-model="vehicle.patent" :rules="ruleRequired" label="Patent" variant="outlined"></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6" md="6">
                            <v-text-field type="number" :disabled="isDeleting" v-model="vehicle.mileage" :rules="rulesMileage" label="Kilometraje" variant="outlined"></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6" md="6">
                            <v-date-input :disabled="isDeleting" v-model="vehicle.register_date" :rules="rulesDate" label="Fecha de registro" variant="outlined"></v-date-input>
                        </v-col>
                        <v-col cols="12">
                            <v-autocomplete
                                variant="outlined"
                                label="Cliente"
                                :items="clients"
                                item-title="fullname"
                                item-value="id"
                                v-model="vehicle.client_id"
                                :rules="rulesClient"
                                :disabled="isDeleting"
                            >
                            </v-autocomplete>
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

    const router = useRouter();

    const search = ref("");
    const headers = ref([
        { title: 'Marca', key: 'brand' },
        { title: 'Modelo', key: 'model' },
        { title: 'Año', align: 'end', key: 'year' },
        { title: 'Pantente', key: 'patent' },
        { title: 'Kilometraje', align: 'end', key: 'mileage' },
        { title: 'Cliente', key: 'client_name' },
        { title: 'Fecha de registro', align: 'end', key: 'register_date'},
        { title: 'Acciones', align: 'center', key: 'actions', sortable: false },
    ]);
    const vehicles = ref([]);
    const vehicle = ref({
        id: '',
        brand: '',
        model: '',
        year: '',
        patent: '',
        mileage: '',
        client_id: null,
        client_name: '',
        register_date: new Date()
    });
    const clients = ref([]);
    const dialog = shallowRef(false);
    const dialogTitle = ref("");
    const isDeleting = shallowRef(false);
    const validData = ref(false);
    const rulesClient = ref([
      value => !!value || 'Seleccione algun cliente.'
    ]);
    const rulesYear = ref([
      v => !!v || 'Complete este campo.',
      v => /^(19\d{2}|2\d{3})$/i.test(v) || 'Año invalido.',
    ]);
    const rulesMileage = ref([
      v => !!v || 'Complete este campo.',
      v => /^\d+(\.\d+)?$/i.test(v) || 'Kilometraje invalido.',
    ]);
    const rulesDate = ref([
        v => !!v || 'Seleccione alguna fecha.',
    ]);
    const ruleRequired = ref([
        v => !!v || 'Complete este campo.',
    ]);

    onMounted(async () => {
        index();
    });

    function index() {
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
        }).then(()=>{
            GeneralService.clientIndex().then((response) => {
                clients.value = response.data;
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
        });
    }

    function showDialog(title, item) {
        isDeleting.value = false;
        dialog.value = true;
        dialogTitle.value = title;
        if (title == "Nuevo") {
            vehicle.value = {
                id: '',
                brand: '',
                model: '',
                year: '',
                patent: '',
                mileage: '',
                client_id: null,
                client_name: '',
                register_date: new Date()
            };
        } else {
            vehicle.value = Object.assign({}, item);
            if (title == "Eliminar") {
                isDeleting.value = true;
            }
        }
    }

    function saveChanges (type) {
        switch (type) {
            case "Nuevo":
                vehicle.value.client_name = clients.value.find(c => c.id === vehicle.value.client_id).fullname;
                vehicle.value.register_date = new Date(vehicle.value.register_date).toISOString().split("T")[0];
                GeneralService.vehicleStore(vehicle.value).then((response) => {
                    dialog.value = false;
                    if (response.status == 201) {
                        index();
                        Swal.fire({
                            toast: true,
                            position: 'top-right',
                            icon: 'success',
                            iconColor: '#FFFFFF',
                            title: '¡Vehiculo registrado exitosamente!',
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

            case "Editar":
                vehicle.value.client_name = clients.value.find(c => c.id === vehicle.value.client_id).fullname;
                vehicle.value.register_date = new Date(vehicle.value.register_date).toISOString().split("T")[0];
                GeneralService.vehicleUpdate(vehicle.value, vehicle.value.id).then((response) => {
                    dialog.value = false;
                    if (response.status == 200) {
                        index();
                        Swal.fire({
                            toast: true,
                            position: 'top-right',
                            icon: 'success',
                            iconColor: '#FFFFFF',
                            title: '¡Vehiculo editado con éxito!',
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

            case "Eliminar":
                GeneralService.vehicleDestroy(vehicle.value.id).then((response) => {
                    dialog.value = false;
                    if (response.status == 200) {
                        index();
                        Swal.fire({
                            toast: true,
                            position: 'top-right',
                            icon: 'success',
                            iconColor: '#FFFFFF',
                            title: '¡Vehiculo desactivado con éxito!',
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