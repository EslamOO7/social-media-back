import Users from '../models/userModel.js'
import { createError } from '../middleware/Errors.js'


export const searchUser = async (req, res,next) => {
    try {
        const users = await Users.find({ username: { $regex: req.query.username } })
            .limit(10).select("fullname username avatar")

        res.json({ users })
    } catch (err) {
        next(err)
    }
}
export const getUser = async (req, res, next) => {
    try {
        const user = await Users.findById(req.params.id).select('-password')
            .populate("followers following", "-password")
        if (!user) return next(createError(400, "this post does not exist"))

        res.json({ user })
    } catch (err) {
        next(err)
    }
}
export const updateUser = async (req, res, next) => {
    try {
        const { avatar, fullname, mobile, address, story, website, gender } = req.body
        if (!fullname) return rnext(createError(400, "please add your fullname"));

        await Users.findOneAndUpdate({ _id: req.user._id }, {
            avatar, fullname, mobile, address, story, website, gender
        })

        res.json({ msg: "Update Success!" })

    } catch (err) {
        next(err)
    }
}
export const follow = async (req, res, next) => {
    try {
        const user = await Users.find({ _id: req.params.id, followers: req.user._id })
        if (user.length > 0) return next(createError(400, "you followed this user"))

        const newUser = await Users.findOneAndUpdate({ _id: req.params.id }, {
            $push: { followers: req.user._id }
        }, { new: true }).populate("followers following", "-password")

        await Users.findOneAndUpdate({ _id: req.user._id }, {
            $push: { following: req.params.id }
        }, { new: true })

        res.json({ newUser })

    } catch (err) {
        next(err)
    }
}
export const unfollow = async (req, res, next) => {
    try {

        const newUser = await Users.findOneAndUpdate({ _id: req.params.id }, {
            $pull: { followers: req.user._id }
        }, { new: true }).populate("followers following", "-password")

        await Users.findOneAndUpdate({ _id: req.user._id }, {
            $pull: { following: req.params.id }
        }, { new: true })

        res.json({ newUser })

    } catch (err) {
        next(err)
    }
}
export const suggestionsUser = async (req, res, next) => {
    try {
        const newArr = [...req.user.following, req.user._id]

        const num = req.query.num || 10

        const users = await Users.aggregate([
            { $match: { _id: { $nin: newArr } } },
            { $sample: { size: Number(num) } },
            { $lookup: { from: 'users', localField: 'followers', foreignField: '_id', as: 'followers' } },
            { $lookup: { from: 'users', localField: 'following', foreignField: '_id', as: 'following' } },
        ]).project("-password")

        return res.json({
            users,
            result: users.length
        })

    } catch (err) {
        next(err)
    }
}