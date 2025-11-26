<template>
    <v-sheet border>
        <v-data-table
            :items="budgets"
            :headers="headers"
            :search="search"
        >
            <template v-slot:top>
                <v-toolbar flat>
                    <v-toolbar-title>
                        <v-row>
                            <v-col cols="auto">
                                <v-icon color="medium-emphasis" icon="mdi-invoice-list" size="x-small"></v-icon>
                                Presupuestos
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
                        text="nuevo presupuesto"
                        border
                        @click="router.push({name: 'nuevoPresupuesto'})"
                    ></v-btn>
                </v-toolbar>
            </template>
            <template v-slot:item.date="{ item }">
                {{ convertDate(item.date).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" }) }}
            </template>

            <template v-slot:item.total="{ item }">
                $ {{ item.total }}
            </template>

            <template v-slot:item.actions="{ item }">
                <v-btn variant="text" density="compact" color="red" icon="mdi-delete" @click="showDialog(item)" title="eliminar"></v-btn>
                <v-btn variant="text" density="compact" color="grey" icon="mdi-eye" @click="router.push({name: 'presupuesto', params: {id: item.id}})" title="ver detalles"></v-btn>
            </template>
        </v-data-table>
    </v-sheet>

    <v-dialog v-model="dialog" max-width="600" persistent>
        <v-card
            title="Anular presupuesto"
            subtitle="¿Seguro que quiere anular este presupuesto?"
        >
            <template v-slot:text>
                <v-row>
                    <v-col cols="12" sm="6" md="6">
                        <v-text-field class="right-text" readonly v-model="budget.number" label="N° Recibo" variant="outlined"></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6" md="6">
                        <v-text-field readonly v-model="budget.client_lastname" label="Apellido" variant="outlined"></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6" md="6">
                        <v-text-field readonly v-model="budget.client_name" label="Nombre" variant="outlined"></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6" md="6">
                        <v-text-field readonly v-model="budget.brand" label="Modelo" variant="outlined"></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6" md="6">
                        <v-text-field readonly v-model="budget.model" label="Modelo" variant="outlined"></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6" md="6">
                        <v-text-field class="center-text" readonly v-model="budget.year" label="Año" variant="outlined"></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6" md="6">
                        <v-text-field readonly v-model="budget.mileage" label="Kilometraje" variant="outlined"></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6" md="6">
                        <v-text-field readonly v-model="budget.patent" label="Patente" variant="outlined"></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6" md="6">
                        <v-text-field class="center-text" readonly v-model="budget.date" label="Fecha" variant="outlined"></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6" md="6">
                        <v-text-field class="right-text" type="number" prefix="$" readonly v-model="budget.total" label="Total" variant="outlined"></v-text-field>
                    </v-col>
                </v-row>
            </template>
                                
            <v-card-actions>
                <v-btn color="red" border text="Cancelar" @click="dialog = false"></v-btn>
                <v-btn color="green" border text="Aceptar" @click="deleteBudget()"></v-btn>
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
        { title: 'N° Recibo', align: 'end', key: 'number' },
        { title: 'Apellido', key: 'client_lastname' },
        { title: 'Nombre', key: 'client_name' },
        { title: 'Marca', key: 'brand' },
        { title: 'Modelo', key: 'model' },
        { title: 'Año', align: 'end', key: 'year' },
        { title: 'Kilometraje', align: 'end', key: 'mileage' },
        { title: 'Patente', key: 'patent' },
        { title: 'Fecha', align: 'end', key: 'date'},
        { title: 'Total', align: 'end', key: 'total' },
        { title: 'Acciones', align: 'center', key: 'actions', sortable: false },
    ]);
    const budgets = ref([]);
    const budget = ref("");
    const dialog = shallowRef(false);

    onMounted(async () => {
        index();
    });

    function index() {
        GeneralService.paymentIndex().then((response) => {
            budgets.value = response.data;
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
        })
    }

    function showDialog(item) {
        dialog.value = true;
        budget.value = Object.assign({}, item);
    }

    function deleteBudget() {
        GeneralService.paymentDestroy(budget.value.id).then((response) => {
            dialog.value = false;
            if (response.status == 200) {
                index();
                Swal.fire({
                    toast: true,
                    position: 'top-right',
                    icon: 'success',
                    iconColor: '#FFFFFF',
                    title: '¡Presupuesto desactivado con éxito!',
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