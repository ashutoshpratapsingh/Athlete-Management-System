const mongoose = require("mongoose");

const athleteSchema = new mongoose.Schema(
    {
        externalId: {
            type: String,
            unique: true,
            sparse: true,
            trim: true
        },

        name: {
            type: String,
            required: true,
            trim: true
        },

        age: {
            type: Number,
            min: 0
        },

        position: {
            type: String,
            trim: true
        },

        club: { 
            type: String, 
            trim: true 
        },

        bloodGroup: { 
            type: String, 
            trim: true 
        },

        assessmentDate: {
             type: Date 
        },

        bestPosition: {
            type: String,
            trim: true
        },

        secondaryPositions: [
            {
                type: String,
                trim: true
            }
        ],

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

const Athlete = mongoose.model("Athlete", athleteSchema);

module.exports = Athlete;