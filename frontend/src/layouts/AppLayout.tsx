import { Outlet } from "react-router-dom";

const AppLayout = () => {
    return (
        <div className="min-h-screen flex">
            <main className="flex-1 flex flex-col">
                <div className="flex-1 overflow-hidden">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AppLayout;
