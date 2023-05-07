import React, { useEffect } from 'react'
import { Box, Container, Text,Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs } from "@chakra-ui/react";
import Signup from '../components/Authentication/Signup';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import Login from '../components/Authentication/Login';
import Image from "../image/chat.png"

const Homepage = () => {

  const history = useHistory();

  useEffect(()=>{
    const user = JSON.parse(localStorage.getItem("userInfo"));

    if(user) 
     history.push('/chats');
  },[history]);

  return (
    <div style={{height:"100vh", width:"100vw", display:"flex"}}>
      <img src={Image} style={{height:"100%", width:"50%"}}></img>
      <div style={{height:"100%", width:"50%" , background:"white"}}>
       <Box
        d="flex"
        justifyContent="center"
        p={3}
        bg="white"
        w="100%"
        m="40px 0 15px 0"
        
        >
        <Text fontSize='4xl'  color="black" ml="33%">
          Chat App
        </Text>
       </Box>

       <Box bg="white" w="100%" p={4} >
       <Tabs isFitted variant="soft-rounded">
          <TabList mb="1em">
            
          </TabList>
          <TabPanels>
            <TabPanel>
              <Login />
            </TabPanel>
            <TabPanel>
              <Signup />
            </TabPanel>
          </TabPanels>
        </Tabs>
       </Box>
    
    </div>
    </div>
  )
}

export default Homepage