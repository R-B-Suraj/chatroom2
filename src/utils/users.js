const users = []

// addUser, removeUser , getUser, getUsersInRoom 

// every single connection to a server has an id associated with it
const addUser = ({id, username, room})=>{
    // Clean data .. trim , validate, lowercase 
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // validate data 
    if(!username || !room){
        return {
            error: 'Username and room are required'
        }
    }

    // check for existing user 
    const existingUser = users.find((user)=>{
        return user.room === room  && user.username === username 
    })

    // validate username 
    if(existingUser){
        return {
            error: 'Username is in use !'
        }
    }

    // store user 
    const user = {id, username, room}
    users.push(user)
    return {user}

}



const removeUser = (id)=>{
    // we could have used filter but filter runs even after finding a match 
    // findIndex stops running once a match is found
    const index = users.findIndex(user=> user.id === id)

    if(index !== -1){
        return users.splice(index, 1)[0]
        // returns an array, cuts the array inplace
    }

}




// addUser({
//     id: 22,
//     username: 'suraj',
//     room: 'game'
// })

// addUser({
//     id: 23,
//     username: 'suraj 2',
//     room: 'game'  
// })

// addUser({
//     id: 24,
//     username: 'suraj 3',
//     room: 'sleep'
// })


// console.log(users)
// const removeduser = removeUser(22)
// console.log(removeduser)
// console.log(users)


const getUser = (id)=>{
    // find returns undefined if user is not found 
    return users.find(user => user.id === id)
}

const getUsersInRoom = (room)=>{
    return users.filter(user => user.room === room)
}


// const userList = getUsersInRoom('sleedfgp')
// console.log(userList)
// const person = getUser(23)
// console.log(person)




module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}