const { Schema, model } = require("mongoose");
const ObjectId = Schema.Types.ObjectId;

const AdminSchema = new Schema(
  {
    authId: {
      type: ObjectId,
      required: true,
      ref: "Auth",
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    profile_image: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    address: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Admin = model("Admin", AdminSchema);

module.exports = Admin;
