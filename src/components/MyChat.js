import React, { useEffect, useState } from 'react'
import { ChatState } from '../context/ChatProvider';
import { Avatar, useToast } from '@chakra-ui/react';
import axios from 'axios';
import {Box } from '@chakra-ui/layout';
import { Button } from '@chakra-ui/button';
import { AddIcon } from '@chakra-ui/icons';
import ChatLoading from './ChatLoading';
import { Stack } from '@chakra-ui/react';
import { Text } from '@chakra-ui/react';
import { getSender, getSenderFullObj } from '../config/ChatLogic';
import GroupChatModal from './chatComponents/GroupChatModal';

const MyChat = ({fetchAgain}) => {

    const [loggedUser,setLoggedUser] = useState();

    const { user,chats,setChats,selectedChat,setSelectedChat } = ChatState();

    const toast = useToast();

    const fetchChats = async() => {
        try{
            const config = {
                headers: {
                   Authorization: `Bearer ${user.token}`,
                },
            };

            const {data} = await axios.get("/api/chat",config);
            console.log(data);
            setChats(data);
        }
        catch(error){
            toast({
                title: "Error Occured",
                description: "Failed To load the Chats",
                status:"error",
                duration:5000,
                isClosable:true
            })
        }
    }
    
   

    useEffect(()=>{
        setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
        fetchChats();
    },[fetchAgain]);

  return (
    <Box 
      display={{base: selectedChat ? "none" : "flex", md:"flex"}}
      flexDir="column"
      alignItems="center"
      p={6}
      bg="white"
      w={{base: "100%", md: "31%"}}
      borderRadius="lg"
    >
    <Box
      pb = {3}  
      px= {3}   
      fontSize={{base:"28px", md:"28px"}}
      display={"flex"}
      w="100%"
      color={"black"}
      justifyContent="space-between"
      alignItems="center"
    >
     MyChats


     <GroupChatModal>
     <Button
       d="flex"
       fontSize={{base:"17px", md:"10px", lg:"12px"}}
       rightIcon={<AddIcon />}
       bg="rgb(51,144,236)"
       color={'white'}
     >
       New Group Chat
     </Button>
     </GroupChatModal>
    </Box>

    <Box
      d="flex"
      flexDir="column"
      p={3}
      bg = "white"
      w="100%"
      h="100%"
      borderRadius="lg"
      overflowY="scroll"  
    >
     
      {
        chats ? (
            <Stack overflowY='scroll'>

              {
                chats.map((chat)=>(
                    <Box
                       onClick={()=> setSelectedChat(chat)}
                       cursor="pointer"
                       bg = { selectedChat === chat ? "rgb(51,144,236)" : "white"}
                       color={ selectedChat === chat ? "black" : "white"}
                       px={2}
                       py={1}
                       style={{borderBottom:"1px solid grey", marginTop:"1px" }}
                       key={chat._id}
                       
                     >
                       <div style={{display:"flex", alignItems:"center"}}>
                      <Avatar
                      width={10}
                      height={10}
                      src={
                        getSenderFullObj(loggedUser, chat.users).pic
                      }
                      mr={2}
                      mt={0}
                    />
                    <div style={{display:"flex", flexDirection:"column" , gap:"3px"}}>
                      <Text style={{fontSize:"18px", color:"black",margin:"0px", marginLeft:"12px"}}>
                        {!chat.isGroupChat ?
                         getSender(loggedUser,chat.users) :
                          chat.chatName}
                      </Text>
                      {chat.latestMessage && (
                  <Text fontSize="12px" color={"whatsapp.500"} marginLeft={"12px"}>
                    
                    <b>{chat.latestMessage.sender.name} : </b>
                    {chat.latestMessage.content.length > 50
                      ? chat.latestMessage.content.substring(0, 30) + "..."
                      : chat.latestMessage.content}
                  </Text>
                )}</div>
                      </div>
                    </Box>
                ))
              }
            </Stack>
        ) : (
            <ChatLoading />
        )
      }
      
    </Box>
    </Box>
  )
}

export default MyChat