import AP from "../model/AP"

const removeController = {
    removeDataInAp: async (req, res) => {
        try {
            await AP.deleteMany({})
            return res.status(200).json({ message: "All data has been removed from AP collection" })
        } catch (e) {
            return res.status(500).json({ message: e.message })
        }
    },
}

export default removeController;
