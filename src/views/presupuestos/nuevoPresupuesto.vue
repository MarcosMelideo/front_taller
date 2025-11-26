<template>
    <v-row>
        <v-col cols="12">
            <v-card flat>
                <v-card-title>
                    <v-col cols="auto">
                        <v-icon color="medium-emphasis" icon="mdi-invoice-list" size="x-small"></v-icon>
                        Nuevo Presupuesto
                    </v-col>
                    
                    <v-row>
                        <v-col cols="4">
                            <v-autocomplete
                                variant="outlined"
                                label="Cliente"
                                :items="clients"
                                item-title="fullname"
                                return-object
                                v-model="client"
                                :rules="rulesClient"
                                @update:modelValue="searchVehicles()"
                                :error="errorClient"
                                :error-messages="msgClient"
                            >
                            </v-autocomplete>
                        </v-col>
                        <v-col cols="4">
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
                            >
                            </v-autocomplete>
                        </v-col>
                        <v-col cols="4">
                            <v-date-input class="center-text" variant="outlined" label="Fecha" v-model="date"></v-date-input>
                        </v-col>
                    </v-row>
                </v-card-title>
            </v-card>
        </v-col>

        <v-col cols="12">
            <v-sheet border>
                <v-data-table
                    :items="budgetItems"
                    :headers="headers"
                    :search="search"
                >
                    <template v-slot:top>
                        <v-toolbar flat>
                            <v-toolbar-title>
                                <v-row>
                                    <v-col cols="auto">
                                        Detalles de presupuesto
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
                                text="Agregar detalle"
                                border
                                @click="dialog = true"
                            ></v-btn>
                        </v-toolbar>
                    </template>

                    <template v-slot:item.quantity="{ item }">
                        <v-text-field flat class="right-text" variant="solo" type="number" v-model="item.quantity" @change="recalculateSubtotal(item)"></v-text-field>
                    </template>

                    <template v-slot:item.price_by_unit="{ item }">
                        <v-text-field flat class="right-text" variant="solo" type="number" prefix="$" v-model="item.price_by_unit" @change="recalculateSubtotal(item)"></v-text-field>
                    </template>

                    <template v-slot:item.actions="{ item }">
                        <v-btn variant="text" density="compact" color="red" icon="mdi-delete" @click="deleteItem(item)" title="eliminar"></v-btn>
                    </template>

                </v-data-table>
            </v-sheet>
        </v-col>
        <v-col cols="12">
            <v-card class="d-flex justify-end" flat>
                <v-card flat>
                    <v-card-text>
                        <v-text-field readonly class="right-text" type="number" density="compact" hide-details variant="outlined" prefix="$" label="Total" v-model="total"></v-text-field>
                    </v-card-text>
                </v-card>
                <v-card flat>
                    <v-card-text>
                        <v-btn color="green" @click="save()">Guardar</v-btn>
                    </v-card-text>
                </v-card>
            </v-card>
        </v-col>
    </v-row>

    <v-dialog v-model="dialog" max-width="500" persistent>
        <v-card
            title="Agregar detalle"
        >
            <template v-slot:text>
                <v-form refs="form" v-model="validData">
                    <v-row>
                        <v-col md="6">
                            <v-text-field variant="outlined" v-model="concept" :rules="required" label="Concepto"></v-text-field>
                        </v-col>
                        <v-col md="6">
                            <v-text-field variant="outlined" v-model="description" :rules="required" label="Descripción"></v-text-field>
                        </v-col>
                        <v-col md="6">
                            <v-text-field class="right-text" variant="outlined" type="number" v-model="quantity" :rules="required" label="Cantidad" @change="calculateSubtotal()"></v-text-field>
                        </v-col>
                        <v-col md="6">
                            <v-text-field class="right-text" variant="outlined" type="number" prefix="$" v-model="price_by_unit" :rules="required" label="Precio Unitario" @change="calculateSubtotal()"></v-text-field>
                        </v-col>
                        <v-col md="12">
                            <v-text-field class="right-text" variant="outlined" type="number" prefix="$" v-model="subtotal" readonly label="Subtotal"></v-text-field>
                        </v-col>
                    </v-row>
                </v-form>
            </template>

            <v-card-actions>
                <v-btn color="red" border text="Cancelar" @click="dialog = false"></v-btn>
                <v-btn color="green" border text="Aceptar" :disabled="!validData" @click="addItem()"></v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script setup>
    import { onMounted, ref, shallowRef } from 'vue';
    import { VDateInput } from 'vuetify/labs/VDateInput';
    import GeneralService from "@/services/GeneralService.js";
    import Swal from "sweetalert2";

    const clients = ref([]);
    const client = ref([]);
    const rulesClient = ref([
        v => !!v || 'Seleccione algun cliente.',
    ]);
    const errorClient = ref(false);
    const msgClient = ref("");
    const vehicles = ref([]);
    const vehicle = ref([]);
    const rulesVehicle = ref([
        v => !!v || 'Seleccione algun vehiculo.',
    ]);
    const errorVehicle = ref(false);
    const msgVehicle = ref("");
    const date =  ref(new Date());
    const budgetItems = ref([]);
    const headers = ref([
        { title: 'Concepto', key: 'concept'},
        { title: 'Descripcion', key: 'description' },
        { title: 'Cantidad', key: 'quantity', align: "end"},
        { title: 'Precio unitario', key: 'price_by_unit', align: "end"},
        { title: 'Subtotal', key: 'subtotal', align: "end"},
        { title: 'Acciones', key: 'actions', sortable: false , align: "center"},
    ]);
    const search = ref("");
    const dialog = shallowRef(false);
    const validData = ref(false);
    const number = ref();
    const concept = ref("");
    const description = ref("");
    const quantity = ref("");
    const price_by_unit = ref("");
    const subtotal = ref("");
    const total = ref(0);
    const required = ref([
        v => !!v || 'Complete este campo.'
    ]);

    onMounted(async () => {
        index();
    });

    function index() {
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

        GeneralService.paymentLastNumber().then((response) => {
            number.value = response.data+1;
        });
    }

    function searchVehicles() {
        if (client.value?.id != null) {
            if (client.value.id>0 && /^-?\d+$/.test(client.value.id)) {
                GeneralService.clientVehicles(client.value.id).then((response) => {
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
            }
        } else {
            vehicle.value = [];
            vehicles.value = [];
        }
    }

    function addItem () {
        budgetItems.value.push({
            concept: concept.value,
            description: description.value,
            quantity: quantity.value,
            price_by_unit: price_by_unit.value,
            subtotal: subtotal.value
        });

        dialog.value = false;

        concept.value = '';
        description.value = '';
        quantity.value = '';
        price_by_unit.value = '';
        subtotal.value = '';
        calculateTotal();
    }

    function calculateSubtotal() {
        subtotal.value = price_by_unit.value * quantity.value;
    }

    function recalculateSubtotal(item){
        const index = budgetItems.value.indexOf(item);
        budgetItems.value[index]["subtotal"] = budgetItems.value[index]["quantity"] * budgetItems.value[index]["price_by_unit"];
        calculateTotal();
    }

    function calculateTotal() {
        let aux = 0;
        budgetItems.value.forEach(item => {
            item.subtotal = parseFloat(item.subtotal).toFixed(2);
            aux = parseFloat(item.subtotal) + aux;
        });
        total.value = aux.toFixed(2);
    }

    function deleteItem (item) {
        const index = budgetItems.value.indexOf(item);
        budgetItems.value.splice(index, 1)
        if (budgetItems.value.length>0) {
            calculateTotal()
        }else{
            budgetItems.value= [];
            total.value = 0;
        }
    }
    function save() {
        errorClient.value = false;
        msgClient.value = '';
        errorVehicle.value = false;
        msgVehicle.value = '';
        if (!client.value?.id || !vehicle.value?.id  || budgetItems.value.length == 0) {
            if(budgetItems.value.length == 0){
                Swal.fire({
                    toast: true,
                    position: 'top-right',
                    icon: 'error',
                    iconColor: '#FFFFFF',
                    title: '¡Debe agregar al menos un item!',
                    showConfirmButton: false,
                    background: '#F44336',
                    color: "#FFFFFF",
                    showCloseButton: true
                });
            }
            if(!client.value?.id){errorClient.value = true; msgClient.value = "Debe seleccionar un cliente"}
            if(!vehicle.value?.id){errorVehicle.value = true; msgVehicle.value = "Debe seleccionar un vehiculo"}
        } else {
            let aux = {
                date: new Date(date.value).toISOString().split("T")[0],
                client_name: client.value.name,
                client_lastname: client.value.lastname,
                client_id: client.value.id,
                
                brand: vehicle.value.brand,
                model: vehicle.value.model,
                patent: vehicle.value.patent,
                year: vehicle.value.year,
                vehicle_id: vehicle.value.id,
                mileage: vehicle.value.mileage,

                total: total.value,
                number: number.value,
                paymentItems: budgetItems.value
            };
            GeneralService.paymentStore(aux).then((response) => {
                if (response.status == 201) {
                    client.value = [];
                    vehicle.value = [];
                    date.value = new Date;
                    budgetItems.value = [];
                    total.value = 0;
                    number.value++;
                    Swal.fire({
                        toast: true,
                        position: 'top-right',
                        icon: 'success',
                        iconColor: '#FFFFFF',
                        title: '¡Presupuesto generado exitosamente!',
                        showConfirmButton: false,
                        timer: 2000,
                        timerProgressBar: true,
                        background: '#4CAF50',
                        color: "#FFFFFF",
                    });
                } else {
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
        }
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