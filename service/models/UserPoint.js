const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userPointSchema = new Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    totalPoint: {
      type: Number,
      default:0
    },
    lastRecordPoint:{
      type: Number,
      default:0
    },
    lastClickTime: {
      type: Number
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("UserPoint", userPointSchema);
