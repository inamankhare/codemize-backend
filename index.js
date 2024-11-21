const express = require("express")

const app = express();

const http = require('http');

const {Server} = require('socket.io');



const server= http.createServer(app)



const io = new Server(server);



const userSocketMap= { };





const getAllConnectedClients = (roomId) => {

    return Array.from(io.sockets.adapter.rooms.get(roomId) ||  []).map((socketId)=>

     {   return {

            socketId,

            username:  userSocketMap[socketId],

        }

    })



};



io.on('connection' , (socket)=>{



    console.log(`User Connected : ${socket.id}`);





    socket.on('join' , ({roomId , username}) =>{



        userSocketMap[socket.id] = username;

        socket.join(roomId);



        const clients= getAllConnectedClients(roomId);

        clients.forEach(({socketId})=>{

            io.to(socketId).emit('newUserJoined' , {username , clients , socketId:socket.id});

        })

    } )  



    socket.on('code-change',({roomId,code})=>{

        socket.in(roomId).emit('code-change',{code});

    })



    // socket.on('sync-code',({socketId,code})=>{

    //     io.to(socketId).emit('sync-code',{code})

    // })



    socket.on('disconnecting',()=>{

        const rooms= [...socket.rooms];

        rooms.forEach((roomId)=>{

            socket.in(roomId).emit('disconnected',{

                socketId:socket.id,

                username:userSocketMap[socket.id]

            })

        })

        delete userSocketMap[socket.id];

        socket.leave();

    })



})











const PORT = process.env.PORT || 5002;

server.listen(PORT,()=> console.log("Server started"))