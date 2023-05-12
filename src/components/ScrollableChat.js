import React, { useState } from 'react';
import ScrollableFeed from 'react-scrollable-feed';
import { isLastMessage, isSameSender, isSameSenderMargin, isSameUser } from '../config/ChatLogic';
import { ChatState } from '../context/ChatProvider';
import { Avatar, Tooltip, Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react';
import axios from 'axios';


const ScrollableChat = (props) => {
  const { user } = ChatState();
  const [selectedMessage, setSelectedMessage] = useState(null);

  const deleteMessage = async (messageId) => {
    console.log("delete started", messageId);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };
      console.log("message id :", messageId);
      const data = await axios.delete(`/api/message/${messageId}`, config);
      if (data) {
        props.deleteMessage(messageId);
      }

      console.log("data:", data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleContextMenu = (event, message) => {
    event.preventDefault();
    setSelectedMessage(message);
  };

  const handleCloseContextMenu = () => {
    setSelectedMessage(null);
  };

  return (
    <>
      <ScrollableFeed>
        {props.messages && props.messages.map((m, i) => (
          <div style={{ display: "flex" }} key={m._id}>
            {isSameSender(props.messages, m, i, user._id) || isLastMessage(props.messages, i, user._id) ? (
              <Tooltip
                label={m.sender.name}
                placement="bottom-start"
                hasArrow
              >
                <Avatar
                  mt="7px"
                  mr={1}
                  size="sm"
                  cursor="pointer"
                  name={m.sender.name}
                  src={m.sender.pic}
                />
              </Tooltip>
            ) : null}
            <span
              style={{
                backgroundColor: `${
                  m.sender._id === user._id ? "#BEE3F8" : "#B9F5D0"
                  }`,
                marginLeft: isSameSenderMargin(props.messages, m, i, user._id),
                marginTop: isSameUser(props.messages, m, i, user._id) ? 3 : 10,
                borderRadius: `${
                  m.sender._id === user._id ? "15px 15px 0px 15px" : "15px 15px 15px 0px"
                  }`,

                padding: "5px 15px",
                maxWidth: "75%",
              }}
              onContextMenu={(event) => handleContextMenu(event, m)}
            >
              {m.content}
              {<img src={m.image}></img>}
            </span>
          </div>
        ))}
     
      {selectedMessage && (
        <Menu
          onClose={handleCloseContextMenu}
          isOpen={Boolean(selectedMessage)}
          placement="bottom-start"
        >
          <MenuButton
            ml={1}
          >
          </MenuButton>
          <MenuList>
            <MenuItem opacity={"70%"} onClick={() => deleteMessage(selectedMessage._id)}>Delete Message</MenuItem>
          </MenuList>
        </Menu>
      )}
    </ScrollableFeed>
    </>
  )
}

export default ScrollableChat;