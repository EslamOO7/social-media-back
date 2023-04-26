import mongoose from "mongoose";
const { Schema } = mongoose;

const conversationSchema = new Schema({
    recipients: [{ type: mongoose.Types.ObjectId, ref: 'user' }],
    text: String,
    media: Array,
    call: Object
}, {
    timestamps: true
})

export default mongoose.model('conversation', conversationSchema)