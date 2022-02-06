const generateMessage = (username,text)=>{
    return {
        text,
        username,
        createdAt: new Date().getTime(),
    }
}

const generateLocationMessage = (data)=>{
    return {
        link: data.link,
        name: data.name,
        createdAt: new Date().getTime(),
    }
}


module.exports ={
    generateMessage,
    generateLocationMessage,
}