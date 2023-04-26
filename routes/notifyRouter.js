import { Router } from 'express';
const router = Router();

import { createNotify, removeNotify,getNotifies,isReadNotify,deleteAllNotifies } from "../controllers/notifyCtrl.js";
import auth from "../middleware/auth.js";

router.post('/notify', auth, createNotify)

router.delete('/notify/:id', auth, removeNotify)

router.get('/notifies', auth, getNotifies)

router.patch('/isReadNotify/:id', auth, isReadNotify)

router.delete('/deleteAllNotify', auth, deleteAllNotifies)



export default router