import ChatLayout from "../../components/chat/ChatLayout";
import StudentUserList from "../../components/chat/StudentUserList";
import ChatWindow from "../../components/chat/ChatWindow";
import { useState } from "react";
import { useSelector } from "react-redux";

const StudentChat = () => {
  const { authUser } = useSelector(state => state.auth);
  const [selectedUser, setSelectedUser] = useState(null);
//   console.log("AUTH USER:", authUser);
console.log("AUTH USER:", authUser);



  return (
    <ChatLayout>
      <StudentUserList
        supervisor={authUser?.supervisor}
        onSelect={setSelectedUser}
      />
      <ChatWindow selectedUser={selectedUser} />
    </ChatLayout>
  );
};

export default StudentChat;
