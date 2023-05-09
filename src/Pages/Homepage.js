import React, { useEffect, useState } from 'react'
import { Box, Text} from "@chakra-ui/react";
import Signup from '../components/Authentication/Signup';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import Login from '../components/Authentication/Login';
import Image from "../image/chat.png"

const Homepage = () => {

  const history = useHistory();
  const [showLogin, setShowLogin] = useState(true);

  useEffect(()=>{
    const user = JSON.parse(localStorage.getItem("userInfo"));

    if(user) 
     history.push('/chats');
  },[history]);

  return (
    <div style={{ height: "100vh", width: "100vw", display: "flex" }}>
      <img src={Image} style={{ height: "100%", width: "50%" }}></img>
      <div style={{ height: "100%", width: "50%", background: "white" }}>
        <Box
          d="flex"
          justifyContent="center"
          p={3}
          bg="white"
          w="80%"
          m="40px 0 15px 0"
        >
          <Text fontSize="4xl" color="black" ml="33%">
            Chat App
          </Text>
        </Box>

        <Box bg="white" marginLeft={"25px"} alignItems={"center"} w="90%" p={4}>
          
          {showLogin ? (
            <div>
              <Login />
              <br />
              <div
                style={{
                  width: "80%",
                  height: "10%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "2%",
                  marginLeft: "80px",
                }}
              >
                <b>New User</b>
                <div
                  onClick={() => setShowLogin(false)}
                  style={{
                    width: "30%",
                    height: "140%",
                    borderRadius: "2px",
                    color: "rgb(8, 204, 253)",
                    cursor: "pointer",
                  }}
                >
                  <b> SignUp</b>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <Signup />
              <br />
              <div
                style={{
                  width: "80%",
                  height: "10%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "2%",
                  marginLeft: "85px",
                }}
              >
                <b>Already Have an account</b>
                <div
                  onClick={() => setShowLogin(true)}
                  style={{
                    width: "30%",
                    height: "100%",
                    borderRadius: "2px",
                    color: "rgb(8, 204, 253)",
                    cursor: "pointer",
                  }}
                >
                  <b>Login</b>
                </div>
              </div>
            </div>
          )}
        </Box>
      </div>
    </div>
  );
}

export default Homepage