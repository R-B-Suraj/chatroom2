// const express = require('express')
// const path = require('path')



// const app = express();

// const port = process.env.PORT || 3000;
// const publicPath  =  path.join(__dirname, '../public')


// app.use(express.static(publicPath))

// app.listen(port,()=>console.log(`listening at port ${port}`))
















// // count  playground..........



// const express = require('express')
// const path = require('path')
// const http = require('http')
// const socketio = require('socket.io')


// const app = express();
// const server = http.createServer(app);
// // express library does this , if we don't 
// // socketio requires a raw http server to be passed when it is called as a function
// // if we wouldn't do it manually we don't have access to server
// // create instance of socket.io to configure socket.io to work with our server

// const io = socketio(server);
// // now our server supports websockets




// const port = process.env.PORT || 3000;
// const publicPath  =  path.join(__dirname, '../public')


// app.use(express.static(publicPath))

// let count = 0

// // // io.on('event name', callback)  listening to events, this runs each time new connection happens
// // io.on('connection', ()=>{
// //     console.log('new connection');
// // })

// io.on('connection', (socket)=>{
//     // socket contains information regarding the new connection using
//     // which we can connect to the client which just connected to server
//     console.log('new websocket connection')

//     // while working with socket.io and transfering data. we send/receive events 
//     // we send an event from server and receive that in client
//     // to send event we use emit('event name(can be customised)', a,b) and some data
//     // anything we provide on emit(), after the event name are going to be available
//     // to callback function on the client , order of function arguments should be same on client side 
//     // as that of server side  
//     socket.emit('countUpdated', count);
//     socket.on('increment', ()=>{
//         count++;
//         // change count and send the event that count has changed
//         // socket.emit('countUpdated', count);
//         // socket.emit here, socket is a particular connection 
//         // so socket.emit will emit to only a particular connection 
//         // if we have multiple clients/browser instances then the browser which sent the event
//         // will be notified about the change not other browsers...
//         io.emit('countUpdated', count);
//         // now the server is emiting event , not the connection
//         // every connection which are on the server will get notified
//     })
// })


// // server.listen to start up our http server created above
// server.listen(port,()=>console.log(`listening at port ${port}`))
























// send welcome message whever a client joins

const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage, generateLocationMessage} = require('./utils/messages')
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users')



const app = express();
const server = http.createServer(app);
const io = socketio(server);



const port = process.env.PORT || 3000;
const publicPath = path.join(__dirname, '../public')

app.use(express.static(publicPath))


io.on('connection',(socket)=>{
    console.log('new websocket connection')
    
    // socket.emit('message',generateMessage('Welcome to Your own chat room'))
    // socket.broadcast.emit('message', generateMessage('A new user has joined'))
    // // io.emit() emits to all the connections
    // socket.emit() emits to a single connection 
    // socket.broadcast.emit() emits to all connections except the one who emited
   
   
    socket.on('join',({username,room}, callback)=>{
        // here the id  socket.id is scoped to all the functions we used below... 
        // we can find the user based on its id, 
        const {error, user} = addUser({id: socket.id, username, room})
        
        

        if(error){
            // if there is any error while joining we acknowledge it to client 
            return callback(error)
        }

        // room is scoped here, other events don't have access to it
        // we may have to store user mapped to rooms 
        socket.join(user.room)
        // join can only be used in server 
        // new way of emiting events , where we are only emiting events to that specific room 
        // socket.emit, io.emit, socket.broadcast.emit
        // io.to.emit  send message to everyone in a room 
        // socket.broadcast.to.emit  send message to everyone except the one who sent inside a room 
   
      
        socket.emit('message',generateMessage('Admin','Welcome to Your own chat room'))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin',`${user.username} has joined`))
        io.to(user.room).emit('roomData', {
            room: user.room, 
            users: getUsersInRoom(user.room)
        })


        callback()
    })
   
   
    socket.on('disconnect', ()=>{

        const user = removeUser(socket.id)
        // if some one tried to join with invalid info, he's connected to server(ie. a new connection was established)
        // but he was never a part of any room. so when he closes browser/ leaves no one should be informed 
        if(user){
            io.to(user.room).emit('message', generateMessage('Admin',`${user.username} has disconnected`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
       
      
    })
    // connection and disconnect are builtin events 
    // disconnect event occurs whever a user closes browser or refresh

    socket.on('sendLocation', (location, callback)=>{
        console.log('location received')
        const user = getUser(socket.id)

        const link = `https://google.com/maps?q=${location.latitude},${location.longitude}`
        
        // socket.broadcast.emit('locationMessage',generateLocation(link) )
       
        io.to(user.room).emit('locationMessage', generateLocationMessage({link: link, name:user.username}))
        callback('Location Shared successfully', link)
    
    })
 
    socket.on('sendMessage',(message, callback)=>{
        const user = getUser(socket.id)

        const filter = new Filter()
        if(filter.isProfane(message)){
            return callback('Profenity is not allowed')
        }
        // message is not sent to others if it is profane
       // io.emit('message',generateMessage(message))
       io.to(user.room).emit('message', generateMessage(user.username,message))
        // callback is a parameter, which is used to acknowledge
        callback('Delivered')
        // inside this callback we can pass data as parameters which can be accessed in client side
        // as parameters of the callback funciton which was passed from emit of sendMessage event client side
    })
})





server.listen(port, ()=> console.log(`listening at port ${port}`))