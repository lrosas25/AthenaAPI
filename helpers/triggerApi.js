import axios from "axios"
export const triggerGenerateAPApi = async () => {
    try {
        const response = await axios.post(`${process.env.API_URL}/v1/ap/generate`)
        console.log("Completed the saving of Csv files in the DB.")
        const res = await axios.post(`${process.env.API_URL}/v1/ap/generate/generateTreasuryClearing`)
        const resData = await axios.post(`${process.env.API_URL}/v1/ap/generate/generateAPSAP`)
    } catch (e) {
        console.log(e.message)
    }
}