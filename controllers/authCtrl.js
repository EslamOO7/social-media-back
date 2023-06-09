import Users from '../models/userModel.js'
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import { createError } from '../middleware/Errors.js'


export const register = async (req, res, next) => {
    try {
        const { fullname, username, email, password, gender } = req.body
        let newUserName = username.toLowerCase().replace(/ /g, '')

        const user_name = await Users.findOne({ username: newUserName })
        if (user_name) return next(createError(400, "This user name already exists."))

        const user_email = await Users.findOne({ email })
        if (user_email) return next(createError(400, "This email already exists."))
        if (password.length < 6)
            return res.status(400).json({ msg: "Password must be at least 6 characters." })

        const passwordHash = await bcrypt.hash(password, 12)

        const newUser = new Users({
            fullname, username: newUserName, email, password: passwordHash, gender
        })


        const access_token = createAccessToken({ id: newUser._id })
        const refresh_token = createRefreshToken({ id: newUser._id })

        res.cookie('refreshtoken', refresh_token, {
            httpOnly: true,
            path: '/api/refresh_token',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30days
        })

        await newUser.save()

        res.json({
            msg: 'Register Success!',
            access_token,
            user: {
                ...newUser._doc,
                password: ''
            }
        })
    } catch (err) {
        next(err)
    }
}
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body

        const user = await Users.findOne({ email })
            .populate("followers following", "avatar username fullname followers following")

        if (!user) return next(createError(400, "This EMail already exists."))
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) return next(createError(400, "password is incorrect"))

        const access_token = createAccessToken({ id: user._id })
        const refresh_token = createRefreshToken({ id: user._id })

        res.cookie('refreshtoken', refresh_token, {
            httpOnly: true,
            path: '/api/refresh_token',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30days
        })

        res.json({
            msg: 'Login Success!',
            access_token,
            user: {
                ...user._doc,
                password: ''
            }
        })
    } catch (err) {
        next(err)
    }
};
export const logout = async (req, res, next) => {
    try {
        res.clearCookie('refreshtoken', { path: '/api/refresh_token' })
        return res.json({ msg: "Logged out!" })
    } catch (err) {
        next(err)
    }
}
export const generateAccessToken = async (req, res, next) => {
    try {
        const rf_token = req.cookies.refreshtoken
        if (!rf_token) return res.status(400).json({ msg: "Please login now." })

        jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET, async (err, result) => {
            if (err) return next(createError( 400, "Please login now." ))

            const user = await Users.findById(result.id).select("-password")
                .populate('followers following', 'avatar username fullname followers following')

            if (!user) return next(createError( 400, "this user do not exist" ))

            const access_token = createAccessToken({ id: result.id })

            res.json({
                access_token,
                user
            })
        })

    } catch (err) {
        return res.status(500).json({ msg: err.message })
    }
}


const createAccessToken = (payload) => {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
}

const createRefreshToken = (payload) => {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '30d' })
}
