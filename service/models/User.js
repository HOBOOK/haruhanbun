const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { USER_STATUS, ROLE } = require("./enum");

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    provider: { type: String},
    picture: {
      type: String,
    },
    status: {
      type: String,
      enum: Object.values(USER_STATUS),
      default: USER_STATUS.ACTIVE,
    },
    refreshToken: {
      type: String,
    },
    lastLogin: {
      type: Date,
    },
    loginTry: {
      type: Number,
      default: 0,
    },
    deletedAt: {
      type: Date,
    },
    point: {
      type: Number,
      default:0
    },
    lastClickTime: {
      type: Number
    },
    refreshToken: String
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
