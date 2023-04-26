import { Router } from 'express';
const router = Router();

import { createComment,updateComment,likeComment,unLikeComment,deleteComment } from "../controllers/commentCtrl.js";
import auth from "../middleware/auth.js"


router.post('/comment', auth, createComment)

router.patch('/comment/:id', auth, updateComment)

router.patch('/comment/:id/like', auth, likeComment)

router.patch('/comment/:id/unlike', auth, unLikeComment)

router.delete('/comment/:id', auth, deleteComment)



export default router