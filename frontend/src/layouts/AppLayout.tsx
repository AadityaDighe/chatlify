import { Outlet } from "react-router-dom";

const AppLayout = () => {
    return (
        <div className="min-h-screen flex overflow-hidden">
            <main className="flex-1 flex flex-col">
                <Outlet />
            </main>
        </div>
    );
};

export default AppLayout;
