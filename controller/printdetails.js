import AP from "../model/AP.js";

const printDetails = {
    printDetailsAP: async (req, res) => {
        try {
            // Extract query parameters from req.params or req.query based on your setup
            const { orderDate, delivDate, material, vendor, shortText } = req.query;
            // Build query object based on provided parameters
            const query = {};
            if (orderDate) query.orderDate = orderDate;
            if (delivDate) query.delivDate = delivDate;
            if (material) query.material = material;
            if (vendor) query.vendor = vendor;
            if (shortText) query.shortText = shortText;
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