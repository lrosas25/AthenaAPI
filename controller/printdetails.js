import AP from "../model/AP.js";

const printDetails = {
    printDetailsAP: async (req, res) => {
        try {
            const { amountinlc, quantity, purcdoc, shorttext, costctr, oun, reference, page, size, allData, refdoc, } = req.query;
            const query = {};
            if (oun) query.oun = oun;
            if (purcdoc) query.purcDoc = purcdoc;
            if (quantity) query.quantity = quantity;
            if (shorttext) query.shortText = shorttext;
            if (costctr) query.costCtr = costctr;
            if (amountinlc) query.AmountInLC = parseFloat(amountinlc);
            if (reference) query.Reference = reference;
            if (refdoc) query.refDoc = refdoc;
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