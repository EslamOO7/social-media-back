import { Router } from 'express';
const router = Router();
import auth from "../middleware/auth.js";

import { createMessage, getConversations, getMessages, deleteMessages, deleteConversation } from '../controllers/messageCtrl.js';

router.post('/message', auth, createMessage)

router.get('/conversations', auth, getConversations)

router.get('/message/:id', auth, getMessages)

router.delete('/message/:id', auth, deleteMessages)

router.delete('/conversation/:id', auth, deleteConversation)


export default router