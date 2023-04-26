import Conversations from '../models/conversationModel.js'
import Messages from '../models/messageModel.js'

class APIfeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    paginating() {
        const page = this.queryString.page * 1 || 1
        const limit = this.queryString.limit * 1 || 9
        const skip = (page - 1) * limit
        this.query = this.query.skip(skip).limit(limit)
        return this;
    }
}


export const createMessage = async (req, res,next) => {
    try {
        const { sender, recipient, text, media, call } = req.body

        if (!recipient || (!text.trim() && media.length === 0 && !call)) return;

        const newConversation = await Conversations.findOneAndUpdate({
            $or: [
                { recipients: [sender, recipient] },
                { recipients: [recipient, sender] }
            ]
        }, {
            recipients: [sender, recipient],
            text, media, call
        }, { new: true, upsert: true })

        const newMessage = new Messages({
            conversation: newConversation._id,
            sender, call,
            recipient, text, media
        })

        await newMessage.save()

        res.json({ msg: 'Create Success!' })

    } catch (err) {
        next(err)
    }
};
export const getConversations = async (req, res,next) => {
    try {
        const features = new APIfeatures(Conversations.find({
            recipients: req.user._id
        }), req.query).paginating()

        const conversations = await features.query.sort('-updatedAt')
            .populate('recipients', 'avatar username fullname')

        res.json({
            conversations,
            result: conversations.length
        })

    } catch (err) {
        next(err)
    }
};
export const getMessages = async (req, res,next) => {
    try {
        const features = new APIfeatures(Messages.find({
            $or: [
                { sender: req.user._id, recipient: req.params.id },
                { sender: req.params.id, recipient: req.user._id }
            ]
        }), req.query).paginating()

        const messages = await features.query.sort('-createdAt')

        res.json({
            messages,
            result: messages.length
        })

    } catch (err) {
        next(err)
    }
};
export const deleteMessages = async (req, res,next) => {
    try {
        const sms = await Messages.findOneAndDelete({ _id: req.params.id, sender: req.user._id });
        res.status(200).json('Delete Success!')
    } catch (err) {
        next(err)
    }
};
export const deleteConversation = async (req, res,next) => {
    try {
        const newConver = await Conversations.findOneAndDelete({
            $or: [
                { recipients: [req.user._id, req.params.id] },
                { recipients: [req.params.id, req.user._id] }
            ]
        })
        await Messages.deleteMany({ conversation: newConver._id })

        res.json({ msg: 'Delete Success!' })
    } catch (err) {
        next(err)
    }
};




