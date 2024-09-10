import AP from "../model/AP.js";
import APSAP from "../model/APSAP.js";
import TreasuryClearing from "../model/TreasuryClearing.js";
import QASPOLineItemMatching from "../model/QASPOLineItemMatching.js";
import QASPOTotal from "../model/QASPOTotal.js";
import Archimedes from "../model/Archimedes.js";

const printDetails = {
    printDetailsAP: async (req, res) => {
        try {
            const { amountinlc, companyname, quantity, purcdoc, shorttext, costctr, oun, reference, page, size, allData, refdoc,
                profitctr, gl_acct, valcl, name1 } = req.query;
            const query = {};
            if (oun) query.oun = oun;
            //asdasdsa
            if (purcdoc) query.purcdoc = purcdoc;
            if (quantity) query.quantity = quantity;
            if (shorttext) query.shortText = shorttext;
            if (costctr) query.costCtr = costctr;
            if (amountinlc) query.AmountInLC = parseFloat(amountinlc);
            if (reference) query.Reference = reference;
            if (refdoc) query.refDoc = refdoc;
            if (profitctr) query.profitCtr = profitctr
            if (gl_acct) query.gl_acct = gl_acct;
            if (valcl) query.valcl = valcl;
            if (name1) query.name1 = name1;
            if (companyname) query.companyname = companyname;
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
            const { cocd, amountInLc, crcy, documentNo, alldata, page, size, vendor, name1 } = req.query
            const query = {}
            if (cocd) query.cocd = cocd
            if (amountInLc) query.amountInLc = parseFloat(amountInLc)
            if (crcy) query.crcy = crcy
            if (documentNo) query.documentNo = documentNo
            if (vendor) query.vendor = vendor
            if (name1) query.name1 = name1
            let list
            if (alldata === "true" || alldata === "True" || alldata === "TRUE") {
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
            const { cocd, vendor, name1, reference, documentno, pstngdate, amountinlc, page, size, alldata } = req.query
            const query = {}
            if (cocd) query.cocd = cocd
            if (vendor) query.vendor = vendor
            if (name1) query.name1 = name1
            if (reference) query.reference = reference
            if (documentno) query.documentno = documentno
            if (pstngdate) query.pstngdate = pstngdate
            if (amountinlc) query.amountinlc = parseFloat(amountinlc)
            let list
            if (alldata === "true" || alldata === "True" || alldata === "TRUE") {
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
            const { purchdoc, item, material, shorttext, costctr, profitctr, alldata, page, size } = req.query
            const query = {}
            if (purchdoc) query.purchdoc = purchdoc
            if (item) query.item = item
            if (material) query.material = material
            if (shorttext) query.shorttext = shorttext
            if (costctr) query.costctr = costctr
            if (profitctr) query.profitctr = profitctr
            let list
            if (alldata === "true" || alldata === "True" || alldata === "TRUE") {
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
            const { purchdoc, totalamountinlc, alldata, page, size } = req.query
            const query = {}
            if (purchdoc) query.purchdoc = purchdoc
            if (totalamountinlc) query.totalamountinlc = parseFloat(totalamountinlc)
            let list

            if (alldata === "true" || alldata === "True" || alldata === "TRUE") {
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
    },
    printDetailsArchimedes: async (req, res) => {
        try {
            const {
                company, location, vendor, itemno, doctype,
                documentno, documentdate, pono, status,
                date, alldata, page, size, wildcard
            } = req.query;
            const query = {};
            // Apply exact matches for specific fields
            if (company) query.company = company;
            if (location) query.location = location;
            if (vendor) query.vendor = vendor;
            if (itemno) query.itemno = itemno;
            if (doctype) query.doctype = doctype;
            if (documentno) query.documentno = documentno;
            if (documentdate) query.documentdate = documentdate;
            if (pono) query.pono = pono;
            if (status) query.status = status;
            if (date) query.date = date;
            if (wildcard) {
                const regex = new RegExp(wildcard, 'i'); // 'i' makes it case-insensitive
                query.$or = [
                    { company: regex },
                    { location: regex },
                    { vendor: regex },
                    { itemno: regex },
                    { doctype: regex },
                    { documentno: regex },
                ];
            }
            let list;
            if (alldata === "true" || alldata === "True" || alldata === "TRUE") {
                list = await Archimedes.find(query).lean();
            } else {
                const pageNumber = parseInt(page, 10) || 1;
                const pageSize = parseInt(size, 10) || 20;
                const skip = (pageNumber - 1) * pageSize;
                list = await Archimedes.find(query).skip(skip).limit(pageSize).lean();
            }

            if (list.length === 0) return res.status(200).json({ message: "No Result Found." });
            return res.status(200).json({ message: "Success.", data: list });
        } catch (e) {
            return res.status(500).json({ message: e.message });
        }
    }
}

export default printDetails;