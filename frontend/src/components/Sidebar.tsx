// import { useNavigate } from 'react-router-dom';
// import assets from '../assets/assets';
// import { useAuth } from '../context/AuthContext';
// import { useChat } from '../context/ChatContext';
// import { useEffect, useState, useRef } from 'react';

// const Sidebar = () => {
//     const { selectedUser, setSelectedUser, getUsers, users, unseenMessages, setUnseenMessages } = useChat();

//     const navigate = useNavigate();
//     const [input, setInput] = useState("")
//     const { logout, onlineUser } = useAuth();

//     const [openMenu, setOpenMenu] = useState(false);
//     const menuRef = useRef<HTMLDivElement | null>(null);

//     useEffect(() => {
//         if (!openMenu) return;

//         const handleClickOutside = (e: MouseEvent) => {
//             if (
//                 menuRef.current &&
//                 !menuRef.current.contains(e.target as Node)
//             ) {
//                 setOpenMenu(false);
//             }
//         };

//         document.addEventListener("mousedown", handleClickOutside);
//         return () => document.removeEventListener("mousedown", handleClickOutside);
//     }, [openMenu]);

//     const filterdUsers = input ? users.filter((user: any) => user.fullName.toLowerCase().includes(input.toLowerCase())) : users

//     useEffect(() => {
//         getUsers()
//     }, [onlineUser])

//     return (
//         <div className={`bg-[#8185B2]/10 h-full p-5 rounded-r-xl overflow-y-auto text-white ${selectedUser ? "max-md:hidden " : ""}`}>
//             <div className="pb-5">
//                 <div className="flex justify-between items-center">
//                     <div className='flex gap-2 items-center'>
//                         <img src={assets.logo_icon} alt="logo" className="max-w-8" />
//                         <p>Chatlify</p>
//                     </div>
//                     <div className="relative">
//                         <img src={assets.menu_icon} alt="Menu" className="max-h-5 cursor-pointer" onClick={() => setOpenMenu(prev => !prev)} />
//                         {openMenu && (
//                             <div
//                                 ref={menuRef}
//                                 className="absolute right-0 mt-2 z-50 w-36 p-4 rounded-md bg-[#282142] border border-gray-600 text-gray-100 shadow-lg">
//                                 <p
//                                     className="cursor-pointer text-sm hover:text-violet-400"
//                                     onClick={() => {
//                                         navigate("/profile");
//                                         setOpenMenu(false);
//                                     }}
//                                 >
//                                     Edit Profile
//                                 </p>

//                                 <hr className="my-2 border-t border-gray-500" />

//                                 <p
//                                     className="cursor-pointer text-sm hover:text-red-400"
//                                     onClick={() => {
//                                         logout();
//                                         setOpenMenu(false);
//                                     }}
//                                 >
//                                     Logout
//                                 </p>
//                             </div>
//                         )}
//                     </div>
//                 </div>

//                 <div className='bg-[#282142] rounded-full flex items-center gap-2 px-4 py-3 mt-5'>
//                     <img src={assets.search_icon} alt="Search" className="w-3" />
//                     <input onChange={(e) => setInput(e.target.value)} type="text" className='bg-transparent border-none outline-none text-white text-xs placeholder-[#c8c8c8] flex-1' placeholder='Search User...' />
//                 </div>
//             </div>

//             <div className='flex flex-col'>
//                 {filterdUsers.map((user: any) => (
//                     <div key={user._id} onClick={() => {
//                         setSelectedUser(user);
//                         setUnseenMessages((prev: any) => ({
//                             ...prev,
//                             [user._id]: 0,
//                         }));
//                     }}
//                         className={`relative flex items-center gap-2 p-2 pl-4 rounded cursor-pointer max-sm:text-sm ${selectedUser?._id === user._id && 'bg-[#282142]/50'}`}>
//                         <img src={user?.profilePic || assets.avatar_icon} alt={user.fullName} className='w-[35px] aspect-[1/1] rounded-full' />
//                         <div>
//                             <p>{user.fullName}</p>
//                             {
//                                 onlineUser.includes(user._id)
//                                     ? <span className='text-green-400 text-xs'>Online </span>
//                                     : <span className='text-neutral-400 text-xs'>Offline </span>
//                             }
//                         </div>

//                         {!!unseenMessages?.[user._id] && (
//                             <p className="absolute top-4 right-4 text-xs h-5 w-5 flex justify-center items-center rounded-full bg-violet-500/50">
//                                 {unseenMessages[user._id]}
//                             </p>
//                         )}

//                     </div>
//                 ))}
//             </div>
//         </div >
//     )
// }

// export default Sidebar
























import { useNavigate } from 'react-router-dom';
import assets from '../assets/assets';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { useEffect, useState, useRef, useMemo } from 'react';

const Sidebar = () => {
    const { selectedUser, setSelectedUser, getUsers, users, unseenMessages, setUnseenMessages } = useChat();

    const { logout, onlineUser } = useAuth();
    const navigate = useNavigate();

    const [openMenu, setOpenMenu] = useState(false);
    const [input, setInput] = useState("")
    const menuRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        getUsers()
    }, [])

    useEffect(() => {
        if (!openMenu) return;

        const handleClickOutside = (e: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(e.target as Node)
            ) {
                setOpenMenu(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [openMenu]);

    const filteredUsers = useMemo(() => {
        if (!input) return users;
        return users.filter((user) =>
            user.fullName.toLowerCase().includes(input.toLowerCase())
        );
    }, [input, users]);

    return (
        <div className={`bg-[#8185B2]/10 h-full p-5 rounded-r-xl overflow-y-auto text-white ${selectedUser ? "max-md:hidden " : ""}`}>
            <div className="pb-5">
                <div className="flex justify-between items-center">
                    <div className='flex gap-2 items-center'>
                        <img src={assets.logo_icon} alt="logo" className="max-w-8" />
                        <p>Chatlify</p>
                    </div>
                    <div className="relative">
                        <img src={assets.menu_icon} alt="Menu" className="max-h-5 cursor-pointer" onClick={() => setOpenMenu(prev => !prev)} />
                        {openMenu && (
                            <div
                                ref={menuRef}
                                className="absolute right-0 mt-2 z-50 w-36 p-4 rounded-md bg-[#282142] border border-gray-600 text-gray-100 shadow-lg">
                                <p
                                    className="cursor-pointer text-sm hover:text-violet-400"
                                    onClick={() => {
                                        navigate("/profile");
                                        setOpenMenu(false);
                                    }}
                                >
                                    Edit Profile
                                </p>

                                <hr className="my-2 border-t border-gray-500" />

                                <p
                                    className="cursor-pointer text-sm hover:text-red-400"
                                    onClick={() => {
                                        logout();
                                        setOpenMenu(false);
                                    }}
                                >
                                    Logout
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className='bg-[#282142] rounded-full flex items-center gap-2 px-4 py-3 mt-5'>
                    <img src={assets.search_icon} alt="Search" className="w-3" />
                    <input onChange={(e) => setInput(e.target.value)} type="text" className='bg-transparent border-none outline-none text-white text-xs placeholder-[#c8c8c8] flex-1' placeholder='Search User...' />
                </div>
            </div>

            <div className='flex flex-col'>
                {filteredUsers.map((user: any) => (
                    <div key={user._id} onClick={() => {
                        setSelectedUser(user);
                        setUnseenMessages((prev: any) => ({
                            ...prev,
                            [user._id]: 0,
                        }));
                    }}
                        className={`relative flex items-center gap-2 p-2 pl-4 rounded cursor-pointer max-sm:text-sm ${selectedUser?._id === user._id && 'bg-[#282142]/50'}`}>
                        <img src={user?.profilePic || assets.avatar_icon} alt={user.fullName} className='w-[35px] aspect-[1/1] rounded-full' />
                        <div>
                            <p>{user.fullName}</p>
                            {
                                onlineUser.includes(user._id)
                                    ? <span className='text-green-400 text-xs'>Online </span>
                                    : <span className='text-neutral-400 text-xs'>Offline </span>
                            }
                        </div>

                        {!!unseenMessages?.[user._id] && (
                            <span className="absolute top-4 right-4 text-xs h-5 w-5 flex justify-center items-center rounded-full bg-violet-500/50">
                                {unseenMessages[user._id]}
                            </span>
                        )}

                    </div>
                ))}
            </div>
        </div >
    )
}

export default Sidebar