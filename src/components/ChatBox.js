import React from 'react'
import {ChatState} from '../context/ChatProvider';
import {Box} from '@chakra-ui/react';
import SingleChat from './SingleChat';

const ChatBox = ({ fetchAgain, setFetchAgain }) => {

    const { selectdChat } = ChatState();
  return (
    <Box
     d={{base: selectdChat ? "flex" : "none", md: "flex" }}
     alignItems="center"
     flexDir="column"
     p={3}
     bg="radial-gradient(ellipse at bottom, #7badec 25%, #1e1f2a 150%)"
     w={{base: "100%", md: "68%"}}
     borderRadius="lg"
     borderWidth="1px"
    >
       <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain}/>
    </Box>
  )
}

export default ChatBox