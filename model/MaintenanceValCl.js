import mongoose from "mongoose";
import { Schema } from "mongoose";

const maintenanceValCl = new Schema({
    chac: {
        type: String
    },
    trs: {
        type: String
    },
    vgcd: {
        type: String
    },
    am: {
        type: String
    },
    valCl: {
        type: String
    },
    glAcct: {
        type: String
    }
})

export default mongoose.model("MaintenanceValCl", maintenanceValCl)