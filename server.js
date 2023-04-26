import { config } from 'dotenv';
import express, { json } from 'express';
import mongoose from "mongoose";
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { ExpressPeerServer } from 'peer'; // form video real time

import path  from'path'


const app = express()

// // Add headers before the routes are defined
// app.use(function (req, res, next) {
    
//     // Website you wish to allow to connect
//     res.setHeader('Access-Control-Allow-Origin', '*');
    
//     // Request methods you wish to allow
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    
//     // Request headers you wish to allow
//     res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    
//     // Set to true if you need the website to include cookies in the requests sent
//     // to the API (e.g. in case you use sessions)
//     res.setHeader('Access-Control-Allow-Credentials', true);
    
//     // Pass to next layer of middleware
//     next();
// });
app.use(express.json())
app.use(cors())
app.use(cookieParser());
config();


// Socket
import http from 'http';
import { Server } from 'socket.io';
import { SocketServer } from './socketServer.js';
const createServer = http.createServer(app);
const io = new Server(createServer);

io.on('connection', (socket) => {
    //console.log(socket.id +' connected');
    SocketServer(socket)
});

// Create peer server
ExpressPeerServer(http, { path: '/' })


// Routes
//Router
import authRouter from './routes/authRouter.js';
app.use('/api', authRouter);
import userRouter from './routes/userRouter.js';
app.use('/api', userRouter);
import postRouter from './routes/postRouter.js';
app.use('/api', postRouter)
import commentRouter from './routes/commentRouter.js';
app.use('/api', commentRouter);
import notifyRouter from './routes/notifyRouter.js';
app.use('/api', notifyRouter);
import messageRouter from './routes/messageRouter.js';
app.use('/api', messageRouter);


const URI = process.env.MONGODB_URL
mongoose.set('strictQuery', true)
    .connect(URI,{ useNewUrlParser: true,useUnifiedTopology: true } )
    .then(() => console.log("DB Connection Successfull!"))
    .catch((err) => { console.log(err); });


// err handling

app.use((error, req, res, next) => {
    const errorStatus = error.status || 500;
    const errorMessage = error.message || "Something went wrong"
    return res.status(errorStatus).json({
        success: false,
        status: errorStatus,
        message: errorMessage,
        stack: error.stack
    })
});

if(process.env.NODE_ENV === 'production'){
    app.use(express.static('client/build'))
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'))
    })
}


const port = process.env.PORT || 5000
createServer.listen(port, () => {
    console.log(`app is listennig on port ${port}`);
})