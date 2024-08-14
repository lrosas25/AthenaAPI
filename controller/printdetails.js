import AP from "../model/AP.js";
import APSAP from "../model/APSAP.js";
import TreasuryClearing from "../model/TreasuryClearing.js";
import QASPOLineItemMatching from "../model/QASPOLineItemMatching.js";
import QASPOTotal from "../model/QASPOTotal.js";

const printDetails = {
    printDetailsAP: async (req, res) => {
        try {
            const { amountinlc, quantity, purcdoc, shorttext, costctr, oun, reference, page, size, allData, refdoc,
                profitctr } = req.query;
            const query = {};
            if (oun) query.oun = oun;
            if (purcdoc) query.purcDoc = purcdoc;
            if (quantity) query.quantity = quantity;
            if (shorttext) query.shortText = shorttext;
            if (costctr) query.costCtr = costctr;
            if (amountinlc) query.AmountInLC = parseFloat(amountinlc);
            if (reference) query.Reference = reference;
            if (refdoc) query.refDoc = refdoc;
            if (profitctr) query.profitCtr = profitctr
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

            if (list.length === 0) return res.status(200).json({ message: "No Result Found." });
            return res.status(200).json({ message: "Success.", data: list });
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    },
    printDetailsQASPO: (req, res) => {

    },
    printDetailsTreasuryClrng: async (req, res) => {
        try {
            const { cocd, amountInLc, crcy, documentNo, allData, page, size } = req.query
            const query = {}
            if (cocd) query.cocd = cocd
            if (amountInLc) query.amountInLc = parseFloat(amountInLc)
            if (crcy) query.crcy = crcy
            if (documentNo) query.documentNo = documentNo
            let list
            if (allData === "true" || allData === "True" || allData === "TRUE") {
                list = await TreasuryClearing.find(query).lean()
            } else {
                const pageNumber = parseInt(page, 10) || 1
                const pageSize = parseInt(size, 10) || 20
                const skip = (pageNumber - 1) * pageSize
                list = await TreasuryClearing.find(query).skip(skip).limit(pageSize).lean()
            }
            if (list.length === 0) return res.status(200).json({ message: "No Result Found." });
            return res.status(200).json({ message: "Success.", data: list });
        } catch (e) {
            return res.status(500).json({ message: e.message })
        }
    },
    printDetailsAPSAP: async (req, res) => {
        try {
            const { cocd, vendor, name1, name2, reference, documentNo, pstngDate, amountInLc, page, size, allData } = req.query
            const query = {}
            if (cocd) query.cocd = cocd
            if (vendor) query.vendor = vendor
            if (name1) query.name1 = name1
            if (name2) query.name2 = name2
            if (reference) query.reference = reference
            if (documentNo) query.documentNo = documentNo
            if (pstngDate) query.pstngDate = pstngDate
            if (amountInLc) query.amountInLc = parseFloat(amountInLc)
            let list
            if (allData === "true" || allData === "True" || allData === "TRUE") {
                list = await APSAP.find(query).lean()
            } else {
                const pageNumber = parseInt(page, 10) || 1
                const pageSize = parseInt(size, 10) || 20
                const skip = (pageNumber - 1) * pageSize
                list = await APSAP.find(query).skip(skip).limit(pageSize).lean()
            }
            if (list.length === 0) return res.status(200).json({ message: "No Result Found." });
            return res.status(200).json({ message: "Success.", data: list });
        } catch (e) {
            return res.status(500).json({ message: e.message })
        }
    },
    printDetailsPOLineItem: async (req, res) => {
        try {
            const { purchDoc, item, material, shortText, costCtr, profitCtr, allData, page, size } = req.query
            const query = {}
            if (purchDoc) query.purchDoc = purchDoc
            if (item) query.item = item
            if (material) query.material = material
            if (shortText) query.shortText = shortText
            if (costCtr) query.costCtr = costCtr
            if (profitCtr) query.profitCtr = profitCtr
            let list
            if (allData === "true" || allData === "True" || allData === "TRUE") {
                list = await QASPOLineItemMatching.find(query).lean()
            } else {
                const pageNumber = parseInt(page, 10) || 1
                const pageSize = parseInt(size, 10) || 20
                const skip = (pageNumber - 1) * pageSize
                list = await QASPOLineItemMatching.find(query).skip(skip).limit(pageSize).lean()
            }
            if (list.length === 0) return res.status(200).json({ message: "No Result Found." });
            return res.status(200).json({ message: "Success.", data: list });
        } catch (e) {
            return res.status(500).json({ message: e.message })
        }
    },
    printDetailsQASPOTotal: async (req, res) => {
        try {
            const { purchDoc, totalAmountInLC, allData, page, size } = req.query
            const query = {}
            if (purchDoc) query.purchDoc = purchDoc
            if (totalAmountInLC) query.totalAmountInLC = parseFloat(totalAmountInLC)
            let list
            if (allData === "true" || allData === "True" || allData === "TRUE") {
                list = await QASPOTotal.find(query).lean()
            } else {
                const pageNumber = parseInt(page, 10) || 1
                const pageSize = parseInt(size, 10) || 20
                const skip = (pageNumber - 1) * pageSize
                list = await QASPOTotal.find(query).skip(skip).limit(pageSize).lean()
            }
            if (list.length === 0) return res.status(200).json({ message: "No Result Found." });
            return res.status(200).json({ message: "Success.", data: list });
        } catch (e) {
            return res.status(500).json({ message: e.message })
        }
    }
}

export default printDetails;