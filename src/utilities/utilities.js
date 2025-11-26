/**
    * Summary. Convierte fecha yyyy-mm-dd, yyyy/mm/dd o dd-mm-yyyy, dd/mm/yyyy a Date
    * @param string fecha yyyy-mm-dd, yyyy/mm/dd or dd-mm-yyyy, dd/mm/yyyy.
    * @return fecha aceptada por el obj Date.
*/
export function convertDate(date) {
    let parts
    if (date.includes("-")) parts = date.split("-") // yyyy-mm-dd o dd-mm-yyyy
    else if (date.includes("/")) parts = date.split("/") // yyyy/mm/dd o dd/mm/yyyy
    else throw new Error("Unsupported format")

    if (parts[0].length === 4) {
        // yyyy-mm-dd
        const [anio, mes, dia] = parts.map(Number)
        return new Date(anio, mes - 1, dia)
    } else {
        // dd-mm-yyyy
        const [dia, mes, anio] = parts.map(Number)
        return new Date(anio, mes - 1, dia)
    }
}