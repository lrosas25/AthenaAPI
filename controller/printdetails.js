import AP from "../model/AP.js";

const printDetails = {
    printDetailsAP: async (req, res) => {
        try {
            const { AmountInLC, quantity, purcDoc, shortText, costCtr, oun, Reference, page, size, allData, refDoc, } = req.query;
            const query = {};
            if (oun) query.oun = oun;
            if (purcDoc) query.purcDoc = purcDoc;
            if (quantity) query.quantity = quantity;
            if (AmountInLC) query.AmountInLC = AmountInLC;
            if (shortText) query.shortText = shortText;
            if (costCtr) query.costCtr = costCtr;
            if (AmountInLC) query.AmountInLC = parseFloat(AmountInLC);
            if (Reference) query.Reference = Reference;
            if (refDoc) query.refDoc = refDoc;
            let list;
            if (allData === "true" || allData === "True" || allData === "TRUE") {
                // Fetch all data without pagination
                list = await AP.find(query).lean();
            } else {
                // Calculate the number of documents to skip
                const pageNumber = parseInt(page, 10) || 1;
                const pageSize = parseInt(size, 10) || 20;
                const skip = (pageNumber - 1) * pageSize;
                // Fetch data based on the constructed query, limited to the page size
                list = await AP.find(query).skip(skip).limit(pageSize).lean();
            }

            if (list.length === 0) return res.status(404).json({ message: "No Result Found." });
            return res.status(200).json({ message: "Success.", data: list });
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }
}

export default printDetails;