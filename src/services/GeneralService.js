import axios from 'axios';

const enlace = 'http://back_taller.test:5000/api/';

export default {
    clientIndex() {
        return axios.get(enlace + 'client');
    },
    clientsDeleted() {
        return axios.get(enlace + 'client/deleted');
    },
    clientStore(data) {
        return axios.post(enlace + 'client', data);
    },
    clientUpdate(data,id){
        return axios.put(enlace + 'client/'+id, data);
    },
    clientDestroy(id){
        return axios.delete(enlace + 'client/'+id);
    },
    clientRestore(id, data){
        return axios.post(enlace + 'client/restore/'+id, data);
    },
    clientShow(id){
        return axios.get(enlace + 'client/'+id);
    },
    clientIsDuplicated(nombre, apellido){
        return axios.get(enlace + 'client/isDuplicated/'+nombre+'/'+apellido)
    },
    clientPayments(id){
        return axios.get(enlace + 'client/payments/'+id)
    },
    clientHasVehicles(id){
        return axios.get(enlace + 'client/hasVehicle/'+id)
    },

    vehicleIndex() {
        return axios.get(enlace + 'vehicle');
    },
    vehicleStore(data) {
        return axios.post(enlace + 'vehicle', data);
    },
    vehicleDeleted() {
        return axios.get(enlace + 'vehicle/deleted');
    },
    vehicleUpdate(data,id){
        return axios.put(enlace + 'vehicle/'+id, data);
    },
    vehicleDestroy(id){
        return axios.delete(enlace + 'vehicle/'+id);
    },
    vehicleRestore(id, data){
        return axios.post(enlace + 'vehicle/restore/'+id, data);
    },
    vehicleShow(id){
        return axios.get(enlace + 'vehicle/'+id);
    },
    vehiclePayments(id){
        return axios.get(enlace + 'vehicle/payments/'+id)
    },
    clientVehicles(id){
        return axios.get(enlace + 'client/vehicles/'+id)
    },


    diagnosisIndex() {
        return axios.get(enlace + 'diagnosis');
    },
    diagnosisStore(data) {
        return axios.post(enlace + 'diagnosis', data);
    },
    diagnosisDeleted() {
        return axios.get(enlace + 'diagnosis/deleted');
    },
    diagnosisUpdate(data,id){
        return axios.put(enlace + 'diagnosis/'+id, data);
    },
    diagnosisDestroy(id){
        return axios.delete(enlace + 'diagnosis/'+id);
    },
    diagnosisRestore(id, data){
        return axios.post(enlace + 'diagnosis/restore/'+id, data);
    },
    diagnosisShow(id){
        return axios.get(enlace + 'diagnosis/'+id);
    },
    vehicleDiagnoses(id){
        return axios.get(enlace + 'vehicle/diagnoses/'+id)
    },
    clientDiagnoses(id){
        return axios.get(enlace + 'client/diagnoses'+id)
    },

    paymentIndex() {
        return axios.get(enlace + 'payment');
    },
    paymentStore(data) {
        return axios.post(enlace + 'payment', data);
    },
    paymentDeleted() {
        return axios.get(enlace + 'payment/deleted');
    },
    paymentUpdate(data,id){
        return axios.put(enlace + 'payment/'+id, data);
    },
    paymentDestroy(id){
        return axios.delete(enlace + 'payment/'+id);
    },
    paymentRestore(id, data){
        return axios.post(enlace + 'payment/restore/'+id, data);
    },
    paymentShow(id){
        return axios.get(enlace + 'payment/'+id);
    },
    paymentShowItems(id){
        return axios.get(enlace + 'payment/items/'+id);
    },
    paymentLastNumber(){
        return axios.get(enlace + 'payment/lastpayment/number');
    },
    paymentShowDeleted(id){
        return axios.get(enlace + 'payment/deleted/'+id);
    },
    paymentItemsShowDeleted(id){
        return axios.get(enlace + 'payment/items/deleted/'+id);
    }
    
}