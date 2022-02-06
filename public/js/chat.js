// // function called io , to connect to server, send/receive events 
// // from server and client both  
// const socket = io()


// // receive event, our custom event declared in server
// socket.on('countUpdated', (count)=>{
//     console.log('the count has been updated', count);
// })



// // send event to server from client 
// document.querySelector('#increment').addEventListener('click',()=>{
//     console.log('increment clicked');
//     socket.emit('increment');
// })


















const socket = io()



// server (emit) => client (receive) --acknowledgement ==> server
// client (emit) => server (receive) --acknowledgement ==> client 

// Elements ... 
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocation = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')


// Templates 
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;



// options 
// location.search gives access to the query string in the browser 
const {username,room} = Qs.parse(location.search, {ignoreQueryPrefix: true})



// whever new message comes auto scroll ,  if some one is deliberately
// looking for chats above , then don't autoscroll 
const autoscroll = ()=>{
    // new message element , which is already been added 
    const $newMessage = $messages.lastElementChild 
    // because new messages are added to bottom 


    // height of the new message, standard content + margin 
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    
    // offsetHeight doesn't take margin into account , and we shouldn't hardcode 
    // the extra margin, because in future if we change styling , and autoscroll breaks. we don't know why 
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin


    // visible height , scroll bar height  need not be same as window height
    const visibleHeight = $messages.offsetHeight 


    // total height of container
    const containerHeight = $messages.scrollHeight 

    // how far have i scrolled 
    const scrollOffset = $messages.scrollTop  + visibleHeight 
    // scrollTop  , amount of distance we scrolled from top of the container 
    // visibleHeight is height of scrollbar ie. visible height of container

    // if user is checking atleast checking 4 messages up
    if(containerHeight - 3*newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight 
        // if user is not at bottom already , don't autoscroll
    }


}




socket.on('message',(received)=>{
    console.log(received)
    // received is an object that is sent from server which contains the message text and createdAt timestamp
    // we provide data as object in render function 
    // this value can be accessed by typing {{key name}} in script
    const html = Mustache.render(messageTemplate,{
        message: received.text,
        createdAt: moment(received.createdAt).format('hh:mm a'),
        username: received.username
    })
    $messages.insertAdjacentHTML('beforeend', html)  
    autoscroll()
})


socket.on('locationMessage',(receivedURL)=>{
    console.log(receivedURL)
    const html = Mustache.render(locationMessageTemplate,{
        link: receivedURL.link,
        createdAt: moment(receivedURL.createdAt).format('hh:mm a'),
        username: receivedURL.name
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})



socket.on('roomData', ({room, users})=>{
    const html = Mustache.render(sidebarTemplate, {
        room, 
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})




$messageForm.addEventListener('submit',(e)=>{ 
    e.preventDefault();
    // disable form during the message is being sent , enable after message is sent 
    
    $messageFormButton.setAttribute('disabled', 'disabled') 
    
    
    
    const message = e.target.elements.message.value
    // name property of inputs inside a form can be accesed this way 

    // acknowledgement is client getting notified that the server received the 
    // event sendMessage and processed successfully , and the code that's going to run 
    // is passed as the last argument in the emit function 
    // in emit we have the event name, then as much data as we want, and then a fumction which will
    // run if event get acknowledged
    socket.emit('sendMessage', message, (receivedMessage)=>{
        console.log('message received : ',receivedMessage)
        // now it's waiting for the event to be acknowledged, which is done in server
        // enable the button 
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        // after sending message valud is set to empty and then input is focused
        // this allows to send message quickly , back to back 
    
    })
})




$sendLocation.addEventListener('click', ()=>{
    // navigator.geolocation everything we need for sending geolocation 
    // if this doesn't exist means the browser don't have support for this 
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser')
    }

    $sendLocation.setAttribute('disabled', 'disabled')

    // this function is asynchronous but don't support promise, we can't use async await, 
    // so we have to use callback funciton 
    navigator.geolocation.getCurrentPosition((position)=>{
        //console.log(position)
        socket.emit('sendLocation',{
            latitude: position.coords.latitude, 
            longitude: position.coords.longitude,
            },(received)=>{
                console.log(received)
                $sendLocation.removeAttribute('disabled')
            })

    })
})



socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href = '/'
        // we want to redirect them to home page , if they couldn't join 
    }
})