const mongoose = require('mongoose');
const Schema = mongoose.Schema,
ObjectId = Schema.ObjectId;

const RewardNodes = new Schema({
UserName: String,
Address: String,
Message: String
});

const NodeModel = mongoose.model('NodeSchema', RewardNodes);
module.exports = NodeModel;