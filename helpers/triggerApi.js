import axios from "axios"
export const triggerGenerateAPApi = async () => {
    try {
        const response = await axios.post(`${process.env.API_URL}/v1/generate`)
        console.log("Completed the saving of Csv files in the DB.")
    } catch (e) {
        console.log(e.message)
    }
}