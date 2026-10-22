import express from 'express';
import { Server } from 'socket.io';
import {createServer} from 'http';
import {YSocketIO} from 'y-socket.io/dist/server';

const app = express();
const httpServer = createServer(app);

app.use(express.static("public"))

const io = new Server(httpServer, {
    cors:{
        origin:"*",
        methods:["GET", "POST"]
    }
})

const YSocketIO12 = new YSocketIO(io)
YSocketIO12.initialize()

app.get('/', (req, res)=>{
    res.status(200).json({
        message:"Hello AD"
    })
})

app.get('/help', (req,res)=>{
    res.status(200).json({message:"OK"})
})

httpServer.listen(3000, ()=>{
    console.log("Server running on Port 3000");
})

