import AP from "../model/AP.js";
import APSAP from "../model/APSAP.js";
import TreasuryClearing from "../model/TreasuryClearing.js";
import QASPOLineItemMatching from "../model/QASPOLineItemMatching.js";
import QASPOTotal from "../model/QASPOTotal.js";
import Archimedes from "../model/Archimedes.js";
import ArchimedesHistory from "../model/ArchimedesHistory.js";
import { bkpf } from "../model/rpa/BKPF.js";
import { bseg } from "../model/rpa/BSEG.js";
import { fb03 } from "../model/rpa/FB03.js";
import BankStatement from "../model/BankStatement.js"
import Clearing from "../model/Clearing.js"

const printDetails = {
    printDetailsAP: async (req, res) => {
        try {
            const { amountinlc,
                name, quantity, purcdoc, shorttext, costctr, oun, reference, page, size, allData, refdoc,
                profitctr, gl_acct, valcl, name1,
                vatregistrationno,
                matdoc } = req.query;
            const query = {};
            if (oun) query.oun = oun;
            //asdasdsa
            if (purcdoc) query.purcdoc = purcdoc;
            if (quantity) query.quantity = quantity;
            if (shorttext) query.shorttext = shorttext;
            if (costctr) query.costctr = costctr;
            if (amountinlc) query.amountinlc = parseFloat(amountinlc);
            if (reference) {
                // to search the reference if the user entered 2100373981 it will find reference = SI# 2100373981
                query.reference = { $regex: new RegExp(reference, 'i') };
            }
            if (refdoc) query.refDoc = refdoc;
            if (profitctr) query.profitctr = profitctr
            if (gl_acct) query.gl_acct = gl_acct;
            if (valcl) query.valcl = valcl;
            if (name1) query.name1 = name1;
            if (name) query.name = name;
            if (vatregistrationno) query.vatregistrationno = vatregistrationno
            if (matdoc) query.matdoc = matdoc
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
                const fieldName = "mvt"; //query

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
            const { cocd, amount, crcy, clringdoc, documentno, alldata, page, size, vendor, name1 } = req.query
            const query = {}
            if (cocd) query.cocd = cocd
            if (amount) query.amount = parseFloat(amount)
            if (crcy) query.crcy = crcy
            if (documentno) query.documentno = documentno
            if (vendor) query.vendor = vendor
            if (name1) query.name1 = name1
            if (clringdoc) query.clringdoc = clringdoc
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
            const {docdate, cocd, vendor, name1, reference, documentno, pstngdate,
                amt, page, size, alldata } = req.query
            const query = {}
            if (docdate) query.docdate = docdate
            if (cocd) query.cocd = cocd
            if (vendor) query.vendor = vendor
            if (name1) query.name1 = name1
            if (reference) query.reference = reference
            if (documentno) query.documentno = documentno
            if (pstngdate) query.pstngdate = pstngdate
            if (amt) query.grossamt = parseFloat(amt)
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
            const { purchdoc, item, material, shorttext, costctr, profitctr, alldata, page, size, amountinlc } = req.query
            const query = {}
            if (purchdoc) query.purchdoc = purchdoc
            if (item) query.item = item
            if (material) query.material = material
            if (shorttext) query.shorttext = shorttext
            if (costctr) query.costctr = costctr
            if (profitctr) query.profitctr = profitctr
            if (amountinlc) query.amountinlc = amountinlc
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
                date, alldata, page, size,voucherno, wildcard
            } = req.query;
            const query = {};
            // Apply exact matches for specific fields
            const valreg = new RegExp(documentdate , 'i');
            //if (documentdate) query.documentdate = documentdate;
            if (company) query.company = company;
            if (location) query.location = location;
            if (vendor) query.vendor = vendor;
            if (itemno) query.itemno = itemno;
            if (doctype) query.documenttype = doctype;
            if (documentno) query.documentno = documentno;
            if (documentdate) query.documentdate = valreg;
            if (pono) query.pono = pono;
            if (status) query.status = status;
            if (date) query.date = date;
            if (voucherno) query.voucherno = voucherno;
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
                const pageSize = parseInt(size, 10) || 500;
                const skip = (pageNumber - 1) * pageSize;
                list = await Archimedes.find(query)
                .populate('history')
                .skip(skip)
                .limit(pageSize)
                .lean();
            }

            if (list.length === 0) return res.status(200).json({ message: "No Result Found." });
            return res.status(200).json({ message: "Success.", totalcount: list.length, data: list });
        } catch (e) {
            return res.status(500).json({ message: e.message });
        }
    },
    

    printDetailsSAPBKPF: async (req, res) => {
        try {
            const { companycode, documentnumber, reference, reversedwith, docstatus, page, size, alldata } = req.query
            const query = {}
            if (companycode) query.companycode = companycode
            if (documentnumber) query.documentnumber = documentnumber
            if (reference) {
                // to search the reference if the user entered 2100373981 it will find reference = SI# 2100373981
                query.reference = { $regex: new RegExp(reference, 'i') };
            }
            if (reversedwith) query.reversedwith = reversedwith
            if (docstatus) query.docstatus = docstatus
            let list
            if (alldata === "true" || alldata === "True" || alldata === "TRUE") {
                list = await bkpf.find(query).lean();
            } else {
                const pageNumber = parseInt(page, 10) || 1;
                const pageSize = parseInt(size, 10) || 20;
                const skip = (pageNumber - 1) * pageSize;
                list = await bkpf.find(query).skip(skip).limit(pageSize).lean();
            }
            if (list.length === 0) return res.status(200).json({ message: "No Result Found." });
            return res.status(200).json({ message: "Success.", data: list });
        } catch (e) {
            return res.status(500).json({ message: e.message })
        }
    },
    printDetailsSAPBSEG: async (req, res) => {
        try {
            const { companycode, documentnumber, lineitem, postingkey, taxcode, withholdingtaxcode, amountinlc, glaccount, profitcenter, page, size, alldata } = req.query
            const query = {}
            if (companycode) query.companycode = companycode
            if (documentnumber) query.documentnumber = documentnumber
            if (taxcode) query.taxcode = taxcode
            if (lineitem) {
                query.lineitem = { $regex: new RegExp(reference, 'i') };
            }
            if (postingkey) query.postingkey = postingkey
            if (withholdingtaxcode) query.withholdingtaxcode = withholdingtaxcode
            if (amountinlc) query.amountinlc = amountinlc
            if (glaccount) query.glaccount = glaccount
            if (profitcenter) query.profitcenter = profitcenter
            let list
            if (alldata === "true" || alldata === "True" || alldata === "TRUE") {
                list = await bseg.find(query).lean();
            } else {
                const pageNumber = parseInt(page, 10) || 1;
                const pageSize = parseInt(size, 10) || 20;
                const skip = (pageNumber - 1) * pageSize;
                list = await bseg.find(query).skip(skip).limit(pageSize).lean();
            }
            if (list.length === 0) return res.status(200).json({ message: "No Result Found." });
            return res.status(200).json({ message: "Success.", data: list });
        } catch (e) {
            return res.status(500).json({ message: e.message })
        }
    },
    printDetailsSAPFB03: async (req, res) => {
        try {
            const { companycode, documentnumber, fiscalyear, documenttype, documentdate, postingdate, reference, parkedby, doctype, reversedwith, entrydate, timeofentry, page, size, alldata } = req.query
            const query = {}
            if (companycode) query.companycode = companycode
            if (documentnumber) query.documentnumber = documentnumber
            if (fiscalyear) query.fiscalyear = fiscalyear
            if (documentdate) query.documentdate = documentdate
            if (documenttype) query.documenttype = documenttype
            if (postingdate) query.postingdate = postingdate
            if (reference) query.reference = reference
            if (parkedby) query.parkedby = parkedby
            if (doctype) query.doctype = doctype
            if (reversedwith) query.reversedwith = reversedwith
            if (entrydate) query.entrydate = entrydate
            if (timeofentry) query.timeofentry = timeofentry

            let list
            if (alldata === "true" || alldata === "True" || alldata === "TRUE") {
                list = await fb03.find(query)
                .populate('bseg')
                .lean();
            } else {
                const pageNumber = parseInt(page, 10) || 1;
                const pageSize = parseInt(size, 10) || 20;
                const skip = (pageNumber - 1) * pageSize;
                list = await fb03.find(query)
                .populate('bseg')
                .skip(skip)
                .limit(pageSize)
                .lean();
            }
            if (list.length === 0) return res.status(200).json({ message: "No Result Found." });
            console.log("Success." + list.length)
            return res.status(200).json({ message: "Success.", data: list });
        } catch (e) {
            console.log("Error." + e.message)
            return res.status(500).json({ message: e.message })
        }
    },
    printDetailsSAPBankStatement: async (req, res) => {
        try{
            const {cocd, date, gl, costctr, page, size } = req.query
            const query = {}
            if (cocd) query.cocd = cocd
            if (date) query.valuedate = new Date(date + "T00:00:00.000Z")
            if (gl) query.gl = gl
            if (costctr) query.costctr = costctr

            const pageNumber = parseInt(page, 10) || 1;
            const pageSize = parseInt(size, 10) || 20;
            const skip = (pageNumber - 1) * pageSize;
            
            let list
            list = await BankStatement.find(query)
            .skip(skip)
            .limit(pageSize)
            .lean()

            if (list.length === 0) return res.status(200).json({ message: "No Result Found." });
            return res.status(200).json({ message: "Success.", length: list.length , data: list });
        }catch(e) {
            return res.status(500).json({ message: e.message })
        }
    },

    printDetailsSAPClearing: async (req, res) => {
        try{
            const {cocd, postingdate, gl, costctr, page, size } = req.query
            const query = {}
            if (cocd) query.CompanyCode = cocd
            if (postingdate) query.PostingDate = new Date(postingdate + "T00:00:00.000Z")
            if (gl) query.GLAccount = gl
            if (costctr) query.CostCenter = costctr

            const pageNumber = parseInt(page, 10) || 1;
            const pageSize = parseInt(size, 10) || 20;
            const skip = (pageNumber - 1) * pageSize;
            
            let list
            list = await Clearing.find(query)
            .skip(skip)
            .limit(pageSize)
            .lean()

            if (list.length === 0) return res.status(200).json({ message: "No Result Found." });
            return res.status(200).json({ message: "Success.", length: list.length , data: list });
        }catch(e) {
            return res.status(500).json({ message: e.message })
        }
    }


}

export default printDetails;