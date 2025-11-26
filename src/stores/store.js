import { defineStore } from "pinia"

export const usePrintState = defineStore("printState", {
    state: () => ({
      value: false
    }),
    actions: {
        changePrintState(newState) {
            this.value = newState;
        }
    }
});