<template>
    <v-sheet border>
        <v-data-table
            :items="clients"
            :headers="headers"
            :search="search"
        >
            <template v-slot:top>
                <v-toolbar flat>
                    <v-toolbar-title>
                        <v-row>
                            <v-col cols="auto">
                                <v-icon color="medium-emphasis" icon="mdi-account" size="x-small"></v-icon>
                                Clientes
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
                        text="Nuevo Cliente"
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
                <v-btn variant="text" density="compact" color="grey" icon="mdi-eye" @click="router.push({name: 'cliente', params: {id: item.id}})" title="ver detalles"></v-btn>
            </template>
        </v-data-table>
    </v-sheet>

    <v-dialog v-model="dialog" max-width="500" persistent>
        <v-card
            :title="`${dialogTitle} cliente`"
            :subtitle="`${isDeleting? '¿Seguro que quiere Desactivar?' : ''}`"
        >
            <template v-slot:text>
                <v-form refs="form" v-model="validData">
                    <v-row>
                        <v-col cols="12" sm="6" md="6">
                            <v-text-field :disabled="isDeleting" :error="clientIsDuplicated" :error-messages="errorMessages" v-model="client.name" :rules="rulesName" label="Nombre" variant="outlined"></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6" md="6">
                            <v-text-field :disabled="isDeleting" :error="clientIsDuplicated" :error-messages="errorMessages" v-model="client.lastname" :rules="rulesLastname" label="Apellido" variant="outlined"></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6" md="6">
                            <v-text-field :disabled="isDeleting" v-model="client.phone" :rules="rulesPhone" label="Teléfono" variant="outlined"></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6" md="6">
                            <v-text-field :disabled="isDeleting" v-model="client.email" :rules="rulesEmail" label="Email" variant="outlined"></v-text-field>
                        </v-col>
                        <v-col cols="12">
                            <v-date-input :disabled="isDeleting" v-model="client.register_date" :rules="rulesDate" label="Fecha de registro" variant="outlined"></v-date-input>
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
    import { useRoute, useRouter } from 'vue-router';
    import { convertDate } from "@/utilities/utilities.js";

    const router = useRouter();
    const route = useRoute();
    
    const deletedClients = shallowRef(false);
    const search = ref("");
    const headers = ref([
        { title: 'Apellido', key: 'lastname' },
        { title: 'Nombre', key: 'name' },
        { title: 'Correo', key: 'email' },
        { title: 'Telefono', align: 'end', key: 'phone' },
        { title: 'Fecha de registro', align: 'end', key: 'register_date'},
        { title: 'Acciones', align: 'center', key: 'actions', sortable: false },
    ]);
    const clients = ref([]);
    const client = ref ({ id: '', name: '', lastname: '', email: '', phone: '', register_date: '' });
    const dialog = shallowRef(false);
    const dialogTitle = ref("");
    const isDeleting = shallowRef(false);
    const hasVehicles = shallowRef(false);
    const clientIsDuplicated = shallowRef(false);
    const errorMessages = ref("");
    const rulesName = ref([
      v => !!v || 'Complete este campo.',
      v => /^[A-Za-zƒŠŒŽšœžŸÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ_\-\s\.']*$/i.test(v) || 'Nombre invalido',
    ]);
    const rulesLastname = ref([
      v => !!v || 'Complete este campo.',
      v => /^[A-Za-zƒŠŒŽšœžŸÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ_\-\s\.']*$/i.test(v) || 'Apellido invalido',
    ]);
    const rulesPhone = ref([
      v => !!v || 'Complete este campo.',
      v => /^\+?\d{6,14}$/i.test(v) || 'Teléfono invalido.',
    ]);
    const rulesEmail = ref([
      v => /^$|^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v) || 'Email invalido.', //este regex permite string vacio
    ]);
    const rulesDate = ref([
        v => !!v || 'Seleccione alguna fecha.',
    ]);
    const validData = ref(false);

    onMounted(async () => {
        // if (route.params.desactivados==='desactivados') {
        //     deletedClients.value = true;
        // }
        index();
    });

    function index() {
        // if (deletedClients.value) {

        // } else {
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
        // }
    }

    function showDialog(title, item) {
        isDeleting.value = false;
        dialog.value = true;
        dialogTitle.value = title;
        if (title == "Nuevo") {
            client.value = { id: '', name: '', lastname: '', email: '', phone: '', register_date: new Date() };
        } else {
            client.value = Object.assign({}, item);
            if (title == "Eliminar") {
                isDeleting.value = true;
            }
        }
    }

    function saveChanges (type) {
        switch (type) {
            case "Nuevo":
                GeneralService.clientIsDuplicated(client.value.name, client.value.lastname).then((response) => {
                    if (response.data) {
                        clientIsDuplicated.value = true;
                        errorMessages.value = "¡Cliente ya existente, utilice otro nombre o apellido!"
                        Swal.fire({
                            toast: true,
                            position: 'top-right',
                            icon: 'warning',
                            iconColor: '#FFFFFF',
                            title: '¡Cliente ya existente, utilice otro nombre o apellido!',
                            showConfirmButton: false,
                            background: '#FB8C00',
                            color: "#FFFFFF",
                            showCloseButton: true
                        })
                    }else{
                        client.value.register_date = new Date(client.value.register_date).toISOString().split("T")[0];
                        GeneralService.clientStore(client.value).then((response) => {
                            dialog.value = false;
                            if (response.status == 201) {
                                index();
                                Swal.fire({
                                    toast: true,
                                    position: 'top-right',
                                    icon: 'success',
                                    iconColor: '#FFFFFF',
                                    title: '¡Cliente registrado exitosamente!',
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
                    }
                });
            break;

            case "Editar":
                client.value.register_date = new Date(client.value.register_date).toISOString().split("T")[0];
                GeneralService.clientUpdate(client.value, client.value.id).then((response) => {
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
                GeneralService.clientHasVehicles(client.value.id).then((response) => {
                    hasVehicles.value = response.data;
                    if (hasVehicles.value) {
                        dialog.value = false;
                        Swal.fire({
                            toast: true,
                            position: 'top-right',
                            icon: 'warning',
                            iconColor: '#FFFFFF',
                            title: '¡El cliente actualmente tiene vehiculos asociados, no se puede desactivar!',
                            showConfirmButton: false,
                            background: '#FB8C00',
                            color: "#FFFFFF",
                            showCloseButton: true
                        })
                    }else{
                        GeneralService.clientDestroy(client.value.id).then((response) => {
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
                    }
                });
            break;
        }
    }

</script>