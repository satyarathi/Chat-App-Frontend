import React, { useEffect, useState } from 'react'
import { ChatState } from '../context/ChatProvider'
import { Box, Text } from '@chakra-ui/layout';
import { Button, FormControl, IconButton, Input, Spinner, useToast } from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import {getSender, getSenderFullObj} from '../config/ChatLogic';
import ProfileModal from '../components/chatComponents/ProfileModal';
import UpdateGroupChatModal from './chatComponents/UpdateGroupChatModal';
import axios from 'axios';
import './styles.css';
import ScrollableChat from './ScrollableChat';
import Picker from 'emoji-picker-react';

import io from "socket.io-client";

const ENDPOINT = "https://8312-221-135-123-50.ngrok-free.app";
var socket, selectedChatCompare;

const SingleChat = ({fetchAgain,setFetchAgain}) => {

   const [messages,setMessages] = useState([]);
   const [loading, setLoading] = useState(false);
   const [newMessage,setNewMessage] = useState();
   const [socketConnected, setSocketConnected] = useState(false);
   
   const [typing, setTyping] = useState(false);
   const [isTyping, setIsTyping] = useState(false);
   const [showEmojis, setShowEmojis] = useState(false);  
   const toast = useToast();

    const { user,selectedChat,setSelectedChat,notification, setNotification } = ChatState();

   

    const fetchMessages = async() => {
      if(!selectedChat)return;
  
      try {
        const config = {
          headers : {
            Authorization: `Bearer ${user.token}`
          }
        };
  
      const {data} = await axios.get(`/api/message/${selectedChat._id}`,config);
  
      console.log(messages);
      setMessages(data)
      setLoading(false);
  
       socket.emit('join chat', selectedChat._id);   
      } catch (error) {
        toast({
          title: "Error Occured..",
          description: "failed to load msg",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
       });
      }
     }

    
  
     useEffect(()=>{
      //starting socket.io
      socket = io(ENDPOINT);
      socket.emit("setup", user);
      socket.on("connected", () => setSocketConnected(true));
      socket.on('typing', ()=> setIsTyping(true));
      socket.on('stop typing', () => setIsTyping(false));
    },[]);

     useEffect(()=>{
       fetchMessages();

       selectedChatCompare = selectedChat;
     },[selectedChat]);

     console.log(notification,'---------------------------->');

     useEffect(()=>{
       socket.on("message received",(newMessageReceived) => {
        if(!selectedChatCompare || 
           selectedChatCompare._id !== newMessageReceived.chat._id
           )
        {
          //give notification
          if(!notification.includes(newMessageReceived)) {
            setNotification([newMessageReceived,...notification]);
            setFetchAgain(!fetchAgain);
          }
        }
        else{
          setMessages([...messages, newMessageReceived]);
        }
       });
     });

    const sendMessage = async(event)=>{

      if(event.key==="Enter" && newMessage){
        socket.emit('stop typing', selectedChat._id)
          try {
            
            const config = {
              headers : {
                "Content-Type": "application/json",
                Authorization: `Bearer ${user.token}`
              }
            };

            setNewMessage("");
            
            const {data} = await axios.post('/api/message',{
              content: newMessage,
              chatId: selectedChat._id,
            },
             config
            );

            console.log(data);

            socket.emit('new message',data);

            setMessages([...messages, data]);
          } catch (error) {
             toast({
                title: "Error Occured..",
                description: "failed to send msg",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
             });
          }
      }
    }

    const sendMail = async () =>{
      console.log("here");
     
      try {

        const config = {
          headers : {
            Authorization: `Bearer ${user.token}`
          }
        };
      const data = await axios.post('http://localhost:5000/api/chat/send-email/'+selectedChat._id,config);
      console.log("data",data);
    }catch(error){
      console.log(error);
    }
    }

      
    const typingHandler = (emojiObject) =>{
      setNewMessage(prev => prev + emojiObject?.emoji);
      // console.log(newMessage)
      setShowEmojis(false);
      // {typing logic}
      if(!socketConnected) return;

      if(!typing) {
        setTyping(true)
        socket.emit('typing', selectedChat._id);
      }

      let lastTypingTime = new Date().getTime()
      var timerLength = 3000;
      setTimeout(() => {
          var timeNow = new Date().getTime();
          var timeDiff = timeNow - lastTypingTime;

          if(timeDiff >= timerLength && typing){
            socket.emit('stop typing', selectedChat._id);
            setTyping(false);
          }
      },timerLength);
    }

  return (
    <>
   
    {
        selectedChat ? (
            <>
           
            <Text
             fontSize={{ base: "28px", md: "30px" }}
             pb={3}
             px={2}
             w="100%"
             color={'white'}
             fontFamily="revert-layer"
             display="flex"
             justifyContent={{ base: "space-between" }}
             alignItems="center"
            >

                <IconButton 
                  style={{backgroundColor:"darkgray"}}
                  d={{base:"flex", md:"none"}}
                  icon={<ArrowBackIcon style={{backgroundColor:"darkgray"}}/>}
                  onClick={()=>setSelectedChat("")}
                />
                
                {!selectedChat.isGroupChat ? (
                    <>
                    {getSender(user, selectedChat.users)}
                    <div style={{marginRight:"-200px", marginBottom:"4px"}}><ProfileModal  style={{backgroundColor:"darkgray"}}  user={getSenderFullObj(user, selectedChat.users)} /></div>
                    </>
                ) : (
                    <>
                    {selectedChat.chatName.toUpperCase()}
                    <UpdateGroupChatModal 
                    fetchAgain={fetchAgain} 
                    setFetchAgain={setFetchAgain}
                    fetchMessages={fetchMessages}
                    />
                    </>
                )}
                <Button onClick={sendMail} style={{backgroundColor:"darkgray"}}>Email</Button>
            </Text>

               <Box 
                 display="flex"
                 flexDir="column"
                 justifyContent="flex-end"
                 p={3}
                 bg="#E8E8E8"
                 w="100%"
                 h="90%"
                 borderRadius="lg"
                 overflowY="hidden"
               >
                 {/* {messgages here} */}
                  
                  {loading ? (
                    <Spinner 
                      size="xl"
                      w={20}
                      h={20}
                      alignSelf="center"
                      margin="auto"
                    />
                  ): (
                    <div className="messages">
                      
                      <ScrollableChat messages={messages} />
                    </div>
                  )}
                   

                  <FormControl onKeyDown={sendMessage} isRequired mt={3}>
                      {isTyping ? <div>typing...</div> : <></>}
                      
                      <div style={{display:"flex"}}>
                      <img className='emoji-icon'
                      src = "http://icons.getbootstrap.com/assets/icons/emoji-smile.svg"
                      style={{margin:"5px", height:"20px"}}
                      onClick={() => setShowEmojis(!showEmojis)} />
                  {showEmojis && <Picker
                   onEmojiClick={typingHandler} />}
                      <Input 
                        variant="filled"
                        bg= "#E0E0E0"
                        placeholder='Enter a message...'
                        onChange={e => setNewMessage(e.target.value)}
                        value={newMessage}        
                      />  
                   </div>
                     
                      
                  </FormControl>
                  
               </Box>
               
            </>
        ) : (
            <Box display='flex' alignItems="center" justifyContent="center" h="100%">
                <Text fontSize="3xl" pb={3} fontFamily="Work sans">
                    Click on a user to start chatting
                </Text>

            </Box>
            
        )
    }
    
    </>
  )
}

export default SingleChat

