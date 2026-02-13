import ChatLayout from "../../components/chat/ChatLayout";
import TeacherUserList from "../../components/chat/TeacherUserList";
import ChatWindow from "../../components/chat/ChatWindow";
import { useState } from "react";
import { useSelector } from "react-redux";

const TeacherChat = () => {
  const { authUser } = useSelector(state => state.auth);
  const [selectedUser, setSelectedUser] = useState(null);

  return (
    <ChatLayout>
      <TeacherUserList
        students={authUser?.assignedStudents || []}
        onSelect={setSelectedUser}
      />
      <ChatWindow selectedUser={selectedUser} />
    </ChatLayout>
  );
};

export default TeacherChat;
