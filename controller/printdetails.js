import AP from "../model/AP.js";

const printDetails = {
    printDetailsAP: async (req, res) => {
        try {
            const { AmountInLC, quantity, purcDoc, shortText, costCtr, oun, Reference } = req.query;
            const query = {};
            if (oun) query.oun = oun;
            if (purcDoc) query.purcDoc = purcDoc;
            if (quantity) query.quantity = quantity;
            if (AmountInLC) query.AmountInLC = AmountInLC;
            if (shortText) query.shortText = shortText;
            if (costCtr) query.costCtr = costCtr;
            if (AmountInLC) query.AmountInLC = parseFloat(AmountInLC)
            if (Reference) query.Reference = Reference
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