// mongoose = MongoDB helper package
import mongoose from "mongoose";


// Schema = database structure blueprint
const donorSchema = new mongoose.Schema(

  {

    // userId = link donor profile with user account
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // type:String = text data
    // required:true = field must be filled
    // trim:true = remove extra spaces
    name: {
      type: String,
      required: true,
      trim: true,
    },


    // Store donor phone number
    phone: {
      type: String,
      required: true,
      trim: true,
    },


    // Store blood group
    bloodGroup: {
      type: String,
      required: true,
    },


    // Store district name
    district: {
      type: String,
      required: true,
      trim: true,
    },


    // Store full address
    address: {
      type: String,
      required: true,
      trim: true,
    },


    // Store uploaded image path
    photo: {
      type: String,
      required: true,
    },

    // availability = donor current donation status
    availability: {
    type: String,
    enum: ["Available", "Unavailable"],
    default: "Available",
    },
  },


  // timestamps:true
  // automatically adds:
  // createdAt
  // updatedAt
  {
    timestamps: true,
  }

  
);


// model = MongoDB collection creator
// "Donor" becomes "donors" collection
const Donor = mongoose.model(
  "Donor",
  donorSchema
);




// export = allow use in other files
export default Donor;