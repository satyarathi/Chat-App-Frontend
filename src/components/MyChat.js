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
import { getSender } from '../config/ChatLogic';
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
      bg="radial-gradient(ellipse at bottom, #7badec 40%, #1e1f2a 100%)"
      w={{base: "100%", md: "31%"}}
      borderRadius="lg"
      borderWidth="1px"
    >
    
    <Box
      pb = {3}  
      px= {3}   
      fontSize={{base:"28px", md:"28px"}}
      display={"flex"}
      w="100%"
      color={"white"}
      fontFamily="Work sans"
      justifyContent="space-between"
      alignItems="center"
    >
     MyChats


     <GroupChatModal>
     <Button
       d="flex"
       fontSize={{base:"17px", md:"10px", lg:"17px"}}
       rightIcon={<AddIcon />}
       bg="radial-gradient(ellipse at left, #0d1d30 50%, #0c0d13 100%)"
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
      bg = "lavender"
      w="100%"
      h="100%"
      borderRadius="lg"
      overflowY="hidden"  //will display the data that will fit in area other will be invisible
    >
      {
        chats ? (
            <Stack overflowY='scroll'>

              {
                chats.map((chat)=>(
                    <Box
                       onClick={()=> setSelectedChat(chat)}
                       cursor="pointer"
                       bg = { selectedChat === chat ? "gray" : "radial-gradient(ellipse at left, #7badec 0%, #1e1f2a 180%)"}
                       color={ selectedChat === chat ? "black" : "white"}
                       px={3}
                       py={2}
                       borderRadius="lg"
                       key={chat._id}
                     >
                       <div style={{display:"flex", alignItems:"center"}}>
                      <Avatar size={'sm'}  src={chat.users[0].pic}/>
                      <Text style={{fontFamily:"emoji", fontSize:"20px", margin:"2px", color:"black"}}>
                        {!chat.isGroupChat ?
                         getSender(loggedUser,chat.users) :
                          chat.chatName}
                      </Text>
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