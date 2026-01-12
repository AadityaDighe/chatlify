import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/chat/ChatContainer";
import RightSidebar from "../components/RightSidebar";
import { useChatStore } from "../store/chat.store";


const Home = () => {
    const selectedUser = useChatStore((s) => s.selectedUser);
    const showRightSidebar = useChatStore((s) => s.showRightSidebar);

    return (
        <div className="w-full h-dvh bg-gradient-to-br from-gray-950 via-indigo-950/30 to-gray-950">
            <div className="relative h-full border border-gray-700/50 rounded-xl md:rounded-2xl overflow-hidden backdrop-blur-xl shadow-2xl">

                <div className={` hidden md:grid h-full ${showRightSidebar && selectedUser ? "md:grid-cols-[320px_1fr_340px]" : "md:grid-cols-[320px_1fr]"}`} >

                    <Sidebar />
                    <ChatContainer />
                    {selectedUser && showRightSidebar && <RightSidebar />}

                </div>

                <div className="md:hidden h-full flex flex-col">
                    {!selectedUser && <Sidebar />}
                    {selectedUser && !showRightSidebar && <ChatContainer />}
                    {selectedUser && showRightSidebar && <RightSidebar mobile={true} />}
                </div>
            </div>
        </div>
    );
};


export default Home