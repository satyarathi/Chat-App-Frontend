import { FormControl, FormLabel, VStack } from '@chakra-ui/react'
import React, { useState } from 'react'
import { Button } from "@chakra-ui/button";
import { Input, InputGroup, InputRightElement } from "@chakra-ui/input";
import { useToast } from "@chakra-ui/toast";
import axios from 'axios';
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";

const Signup = () => {
    const [name,setName] = useState();
    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
    const [pic, setPic] = useState();
    const [show, setShow] = useState(false);
    const [loading,setLoading] = useState(false)
    const toast = useToast();
    const history = useHistory();

    const handleClick = () => setShow(!show);

    const postDetails = (pics) => {
      setLoading(true);
      if(pics === undefined)
      {
        toast({
          title: "Please Select an Image!",
          status: "warning",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
        return;
      }

      if(pics.type==="image/jpeg" || pics.type ==="image/png") {
        const data = new FormData();
        data.append("file",pics);
        data.append("upload_preset","chat-app");
        data.append("cloud_name","dmsibzcrw");
        fetch("https://api.cloudinary.com/v1_1/dmsibzcrw/image/upload",{
          method:"post",
          body: data
        }).then((res)=> res.json())
         
          .then(data => {
            setPic(data.url.toString());
           console.log(data.url.toString());
            setLoading(false);
          })
          .catch((err)=> {
            console.log(err);
            setLoading(false);
          })
      } 
      else {
        toast({
          title: "Please Select an Image!",
          status: "warning",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
        setLoading(false);
        return;
      }
    } 

    const submitHandler = async() => {
      setLoading(true);
      if (!name || !email || !password ) {
        toast({
          title: "Please Fill all the Feilds",
          status: "warning",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
        setLoading(false);
        return;
      }

      try {
        const config = {
          headers: {
            "Content-type": "application/json",
          },
        };
        const { data } = await axios.post(
          "/api/user",
          {
            name,
            email,
            password,
            pic,
          },
          config
        );
        console.log(data);
        toast({
          title: "Registration Successful",
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
        localStorage.setItem("userInfo", JSON.stringify(data));
        setLoading(false);
        history.push("/chats");
        window.location.reload()
      } catch (error) {
        toast({
          title: "Error Occured!",
          description: error.response.data.message,
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
        loading(false);
      }
    }
  return (
    <VStack spacing='5px' color="black">
     <FormControl id='first-name' isRequired>
        <FormLabel>Name</FormLabel>
        <Input 
          _placeholder='Enter Your Name'
          onChange={(e)=>setName(e.target.value)}
          style={{borderTop:"0px", borderLeft:"0px", borderRight:"0px", bordeBottom:"2px solid black"}}
        />
     </FormControl>

     <FormControl id='email' isRequired>
        <FormLabel>email</FormLabel>
        <Input 
          _placeholder='Enter Your email'
          onChange={(e)=>setEmail(e.target.value)}
          style={{borderTop:"0px", borderLeft:"0px", borderRight:"0px", bordeBottom:"2px solid black"}}
        />
     </FormControl>

     <FormControl id='password' isRequired>
        <FormLabel>Password</FormLabel>
        <InputGroup size="md">
          <Input
            type={show ? "text" : "password"}
            placeholder="Enter Password"
            onChange={(e) => setPassword(e.target.value)}
            style={{borderTop:"0px", borderLeft:"0px", borderRight:"0px", bordeBottom:"2px solid black"}}
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleClick}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
     </FormControl>

      <FormControl id="pic">
        <FormLabel>Upload your Picture</FormLabel>
        <Input
          type="file"
          p={1.5}
          accept="image/*"
          onChange={(e) => postDetails(e.target.files[0])}
        />
      </FormControl>

      <input
        type="submit"
        name="name"
        className="btn"
        value="Register User"
        onClick={submitHandler}
        style={{cursor:'pointer', backgroundImage:"linear-gradient(to right, #08CCFD, #0379FD)", display: 'block', width: '100%',padding: '8px', borderRadius: '30px',color: '#fff',
        border:'0',
        fontSize: '19px'
        }}
      /> 

    </VStack>
  )
}

export default (Signup)



