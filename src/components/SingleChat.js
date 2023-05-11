import React, { useEffect, useRef, useState } from "react";
import { ChatState } from "../context/ChatProvider";
import { Box, Text } from "@chakra-ui/layout";
import {
  Button, FormControl, IconButton, Input, Spinner, useToast,
} from "@chakra-ui/react";
import { ArrowBackIcon, AttachmentIcon } from "@chakra-ui/icons";
import { getSender, getSenderFullObj } from "../config/ChatLogic";
import ProfileModal from "../components/chatComponents/ProfileModal";
import UpdateGroupChatModal from "./chatComponents/UpdateGroupChatModal";
import axios from "axios";
import "./styles.css";
import ScrollableChat from "./ScrollableChat";
import Picker from "emoji-picker-react";
import Image from "../image/tele.jpg";
import NotificationSound from '../Audio/Notification.mp3';

import io from "socket.io-client";

const ENDPOINT = "http://localhost:5000";
var socket, selectedChatCompare;


const emojiPickerStyle = {
  position: "absolute",
  bottom: "calc(100% + 10px)",
  left: 0,
  zIndex: 1,
};

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState();
  const [socketConnected, setSocketConnected] = useState(false);
  const [pic, setPic] = useState();
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const toast = useToast();

  const { user, selectedChat, setSelectedChat, notification, setNotification } =
    ChatState();


  function playNotificationSound() {
      new Audio(NotificationSound).play();
  }

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        config
      );

      console.log(messages);
      setMessages(data);
      setLoading(false);

      socket.emit("join chat", selectedChat._id);
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
  };

  useEffect(() => {
    //starting socket.io
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));
  }, []);

  useEffect(() => {
    fetchMessages();

    selectedChatCompare = selectedChat;
  }, [selectedChat]);

  console.log(notification, "---------------------------->");

  useEffect(() => {
    socket.on("message received", (newMessageReceived) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageReceived.chat._id
      ) {
        //give notification
        if (!notification.includes(newMessageReceived)) {
          setNotification([newMessageReceived, ...notification]);
          setFetchAgain(!fetchAgain);

          //play sound
            playNotificationSound()
        }
      } else {
        setMessages([...messages, newMessageReceived]);
      }
    });
  });

  const sendMessage = async (event) => {
    if (event.key === "Enter" && newMessage) {
      socket.emit("stop typing", selectedChat._id);
      try {
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };

        setNewMessage("");

        const { data } = await axios.post(
          "/api/message",
          {
            content: newMessage,
            image: "",
            chatId: selectedChat._id,
          },
          config
        );

        console.log(data);

        socket.emit("new message", data);

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
  };

  const sendImage = async () => {
    try {

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`
        }
      };

      setNewMessage("");

      const { data } = await axios.post('/api/message', {
        content: '',
        image: pic,
        chatId: selectedChat._id,
      },
        config
      );

      console.log(data);

      socket.emit('new message', data, data.image);


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

  const uploadImage = async (pics) => {
    try {
      if (pics.type === "image/jpeg" || pics.type === "image/png") {
        const data = new FormData();
        data.append("file", pics);
        data.append("upload_preset", "chat-app");
        data.append("cloud_name", "dmsibzcrw");
        fetch("https://api.cloudinary.com/v1_1/dmsibzcrw/image/upload", {
          method: "post",
          body: data
        }).then((res) => res.json())

          .then(data => {
            setPic(data.url.toString());
            console.log(data.url.toString());
            setLoading(false);
          })
          .catch((err) => {
            console.log(err);
            setLoading(false);
          })
      }



    } catch (error) {
      console.log(error);
    }
  }

  const sendMail = async () => {
    console.log("here");

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const data = await axios.post(
        "api/chat/send-email/" + selectedChat._id + "," + user.email, config
      );
      console.log("data", data);
    } catch (error) {
      console.log(error);
    }
  };


const inputRef = useRef();
  const sendImogi = (emojiObject) => {
    const newMessageWithEmoji = newMessage + emojiObject?.emoji;
  setNewMessage(newMessageWithEmoji);
    // console.log(newMessage)
    
    setShowEmojis(false);
    inputRef.current.focus()

  }

  const typingHandler = (event) => {
    setNewMessage(event.target.value)
    // {typing logic}
    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }

    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;

      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  return (
    <>
      {selectedChat ? (
        <>
         
            <Text
              fontSize={{ base: "28px", md: "30px" }}
              pb={3}
              px={2}
              w="100%"
              color={"black"}
              
              display="flex"
              justifyContent={{ base: "flex-start" }}
              alignItems="center"
              
            >
              <IconButton
                style={{ backgroundColor: "rgb(51,144,236)", marginRight:"30px" }}
                d={{ base: "flex", md: "none" }}
                icon={<ArrowBackIcon style={{ backgroundColor: "rgb(51,144,236)" }} />}
                onClick={() => setSelectedChat("")}
              />
                
              {!selectedChat.isGroupChat ? (
                <>
                  <div style={{width:"800px"}}>{getSender(user, selectedChat.users)}</div>
                  <div
                    style={{
                      marginBottom: "4px",
                      
                      color: "rgb(51,144,236)",
                      
                    }}
                  >
                    <ProfileModal
                      user={getSenderFullObj(user, selectedChat.users)}
                      
                    />
                  </div>
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
              <Button style={{ backgroundColor: "rgb(51,144,236)", marginLeft:"15px" }} onClick={sendMail}>
                Email
              </Button>
            </Text>
          

          <Box
            display="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            backgroundImage={Image}
            opacity="85%"
            w="100%"
            h="90%"
            borderRadius="lg"
            overflowY="scroll"
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
            ) : (
              <div className="messages">
                <ScrollableChat messages={messages} />
              </div>
            )}

            <FormControl display={"flex"}>
              {showEmojis && (
                <Box style={emojiPickerStyle}>
                  <Picker
                    value={newMessage}
                    onEmojiClick={ sendImogi}
                    onKeyDown={sendMessage}
                  />
                </Box>
              )}
              <IconButton
                aria-label="Emojis"
                icon={
                  <span role="img" aria-label="smile">
                    &#x1F600;
                  </span>
                }
                onClick={() => setShowEmojis(!showEmojis)}
                variant="ghost"
                size="lg"
                isRound
              />
              <Input
                placeholder="Type a message..."
                color={"black"}
                border={"1px solid black"}
                size="lg"
                value={newMessage}
                onChange={typingHandler}
                onKeyDown={sendMessage}
                onFocus={() => setShowEmojis(false)}
                ref={inputRef}
              />

              <IconButton
                as="label"
                htmlFor="upload"
                icon={<AttachmentIcon />}
                fontSize="20px"
                variant="ghost"
                _hover={{ bg: "transparent" }} />
              <input
                id="upload"
                type="file"
                accept="image/*"
                onChange={(e) => uploadImage(e.target.files[0])}
                style={{ display: "none" }} />
              <Button type="submit" onClick={sendImage}> Send</Button>
            </FormControl>

          </Box>
        </>
      ) : (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          h="100%"
        >
          <Text fontSize="3xl" pb={3} fontFamily="Work sans">
            Click on a user to start chatting
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;
