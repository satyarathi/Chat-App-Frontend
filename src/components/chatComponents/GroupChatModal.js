
import React, { useState } from 'react'
import { useDisclosure, useToast } from '@chakra-ui/react'
import { Modal,ModalBody,ModalOverlay,ModalFooter,ModalHeader, ModalCloseButton, ModalContent } from '@chakra-ui/react';
import { Button } from '@chakra-ui/react';
import { ChatState } from '../../context/ChatProvider';
import { FormControl } from '@chakra-ui/form-control';
import { Input } from '@chakra-ui/react';
import axios from 'axios';
import UserListItem from '../UserAvatar/UserListItem';
import UserBadgeItem from '../UserAvatar/UserBadgeItem';
import { Box } from '@chakra-ui/react';

const GroupChatModal = ({children}) => {

    const { isOpen, onOpen, onClose } = useDisclosure()

    const [groutChatName,setGroupChatName] = useState();
    const [selectedUsers,setSelectedUsers] = useState([]);
    const [search,setSearch] = useState("");
    const [searchResult,setSearchResult] = useState([]);
    const [loading,setLoading] = useState(false);

    const toast = useToast();

   const {user, chats, setChats} = ChatState();

   const handleSearch=async(query)=>{
     
      setSearch(query)
      if(!query) {
        return;
      }

      try{
        setLoading(true);

        const config = {
            headers : {
                Authorization: `Bearer ${user.token}`,
            },
        };

        const {data} = await axios.get(`/api/user?search=${search}`, config);

        console.log(data);

        setLoading(false);
        setSearchResult(data);

      }catch(error) {
          toast({
            title: "Error Occured",
            description: "Failed to load",
            status:"error",
            duration:5000,
            isClosable: true,
            position: "bottom-right"
          });
      }
   };

   const handleSubmit=async()=>{

      
        if(!groutChatName && !selectedUsers) {
            toast({
                title:"please fill all the details",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "top"
            });
            return ;
          }    

      try{
           const config={
             headers:{
                 Authorization: `Bearer ${user.token}`
             }
           };

           const {data}= await axios.post(
            '/api/chat/group',
            {
                name: groutChatName,
                users: JSON.stringify(selectedUsers.map((u)=> u._id)),
            },
            config);

            setChats([data,...chats]);
            onClose();

            toast({
                title: "New Group Created",
                status:"success",
                duration: 5000,
                isClosable: true,
                position: "bottom"
            });
      }    
      catch(error) {
        toast({
            title: "Failed to create the Chat",
            description: error.response.data,
            status:"error",
            duration: 5000,
            isClosable: true,
            position: "bottom"
        });
      }
   };

   const handleDelete=(deleteUser)=>{
     setSelectedUsers(selectedUsers.filter(sel => sel._id !== deleteUser._id))
   };

   const handleGroup=(userToAdd)=>{

      if(selectedUsers.includes(userToAdd)) {
        toast({
            title: "User already added",
            status: "warning",
            duration: 5000,
            isClosable: true,
            position: "top"
        });
        return;
      }

      setSelectedUsers([...selectedUsers,userToAdd]);
   };
  return (
    <div>
        <span onClick={onOpen}>{children}</span>

       <Modal isOpen={isOpen} onClose={onClose} isCentered>
           <ModalOverlay />
               <ModalContent>
                <ModalHeader
                  fontSize="35px"
                  fontFamily="Work sans"
                  display={"flex"}
                  justifyContent={"center"}
                >
                    Create Group Chat
                </ModalHeader>
                  <ModalCloseButton />
                      <ModalBody
                         display={"flex"}
                         flexDir={"column"}
                         alignItems={"center"}
                      >
                          <FormControl>
                             <Input 
                             placeholder="Chat Name" 
                             mb={3}
                             onChange={(e)=>setGroupChatName(e.target.value)}
                             />
                          </FormControl>

                          <FormControl>
                             <Input 
                             placeholder="Add Users" 
                             mb={1}
                             onChange={(e)=>handleSearch(e.target.value)}
                             />
                          </FormControl>


                                {/* {Selectd users} */}
                              <Box w="100%" display={"flex"} flexWrap={"wrap"}>
                                {selectedUsers.map(u=>(
                                  <UserBadgeItem key={user._id} user={u} 
                                    handleFunction={()=>handleDelete(u)}
                                  />
                               ))}
                              </Box>

                          {/* {render searched users} */}
                          {
                            loading ? (
                                <div>loading</div>
                            ) : (
                                searchResult
                                 .slice(0,4)
                                  .map((user)=> 
                                   <UserListItem 
                                     key={user._id} 
                                      user={user}
                                       handleFunction={()=>handleGroup(user)}
                                    />
                                  )
                                )
                          }
                      </ModalBody>

             <ModalFooter>
                 <Button colorScheme='purple' onClick={handleSubmit} >
                   Create Chat
                </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
    </div>
  )
}

export default GroupChatModal