import axios from "axios"
export const triggerGenerateAPApi = async () => {
    try {
        const response = await axios.post(`${process.env.API_URL}/v1/ap/generate`)
    } catch (e) {
        console.log(e.message)
    }
}

export const triggerGenerateTreasuryApi = async () => {
    try {
        const res = await axios.post(`${process.env.API_URL}/v1/ap/generate/generateTreasuryClearing`)
    } catch (e) {
        console.log(e.message)
    }
}

export const triggerGenerateAPSAPApi = async () => {
    try {
        const resData = await axios.post(`${process.env.API_URL}/v1/ap/generate/generateAPSAP`)
    } catch (e) {
        console.log(e.message)
    }
}
