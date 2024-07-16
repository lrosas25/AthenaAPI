import AP from "../model/AP.js";

const printDetails = {
    printDetailsAP: async (req, res) => {
        try {
            // Extract query parameters from req.params or req.query based on your setup
            const { AmountInLC, quantity, purcDoc, shortText, costCtr, oun, Reference } = req.query;
            // Build query object based on provided parameters
            const query = {};
            if (oun) query.oun = oun;
            if (purcDoc) query.purcDoc = purcDoc;
            if (quantity) query.quantity = quantity;
            if (AmountInLC) query.AmountInLC = AmountInLC;
            if (shortText) query.shortText = shortText;
            if (costCtr) query.costCtr = costCtr;
            if (Reference) query.Reference = Reference;
            // Fetch data based on the constructed query
            const list = await AP.find(query).lean();
            if (list.length === 0) return res.status(404).json({ message: "No Result Found." })
            return res.status(200).json({ message: "Success.", data: list });
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }
}

export default printDetails;