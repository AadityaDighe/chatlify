import { useState } from "react";
import ChatContainer from "../components/ChatContainer";
import RightSidebar from "../components/RightSidebar";
import Sidebar from "../components/Sidebar";
import { useChat } from "../context/ChatContext";

const Home = () => {
    const { selectedUser } = useChat();
    const [showRightSidebar, setShowRightSidebar] = useState(false);

    return (
        <div className="w-full h-screen sm:px-[15%] sm:py-[5%]">
            <div className="relative h-full border-2 border-gray-600 rounded-2xl overflow-hidden backdrop-blur-xl">

                {/* DESKTOP GRID */}
                <div
                    className={`
            hidden md:grid h-full
            ${selectedUser
                            ? showRightSidebar
                                ? "grid-cols-[1fr_2fr_1fr]"
                                : "grid-cols-[1fr_3fr]"
                            : "grid-cols-2"}
          `}
                >
                    <Sidebar />
                    <ChatContainer
                        showRightSidebar={showRightSidebar}
                        setShowRightSidebar={setShowRightSidebar}
                    />
                    {showRightSidebar && <RightSidebar />}
                </div>

                {/* MOBILE STACK */}
                <div className="md:hidden h-full">
                    {!selectedUser && <Sidebar />}

                    {selectedUser && !showRightSidebar && (
                        <ChatContainer
                            showRightSidebar={showRightSidebar}
                            setShowRightSidebar={setShowRightSidebar}
                        />
                    )}

                    {showRightSidebar && (
                        <RightSidebar onClose={() => setShowRightSidebar(false)} />
                    )}
                </div>

            </div>
        </div>
    );
};

export default Home;