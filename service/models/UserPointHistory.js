const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userPointHistorySchema = new Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    order: {
      type: Number,
      default:0
    },
    point: {
      type: Number,
      default:0
    },
    prevPoint: {
      type: Number,
      default:0
    },
    savePoint: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("UserPointHistory", userPointHistorySchema);
