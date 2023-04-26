import { Router } from 'express';
const router = Router();

import {
    createPost,
    getPosts,
    updatePost,
    likePost,
    unLikePost,
    getUserPosts,
    getPost,
    getPostsDicover
    , deletePost,
    savePost,
    unSavePost,
    getSavePosts
} from "../controllers/postCtrl.js"
import auth from "../middleware/auth.js"

router.route('/posts')
    .post(auth, createPost)
    .get(auth, getPosts)

router.route('/post/:id')
    .patch(auth, updatePost)
    .get(auth, getPost)
    .delete(auth, deletePost)

router.patch('/post/:id/like', auth, likePost)

router.patch('/post/:id/unlike', auth, unLikePost)

router.get('/user_posts/:id', auth, getUserPosts)

router.get('/post_discover', auth, getPostsDicover)

router.patch('/savePost/:id', auth, savePost)

router.patch('/unSavePost/:id', auth, unSavePost)

router.get('/getSavePosts', auth, getSavePosts)


export default router;