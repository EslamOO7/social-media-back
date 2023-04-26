import express  from "express";
const router = express.Router();
import { register, login, logout, generateAccessToken } from '../controllers/authCtrl.js';


router.post('/register', register)

router.post('/login', login)

router.post('/logout', logout)

router.post('/refresh_token', generateAccessToken)


export default router