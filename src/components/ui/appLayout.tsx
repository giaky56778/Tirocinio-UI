import NavSidebar from "@/components/layout/navBar.tsx";
import ParamsProvider from "@/contexts/paramsProvider.tsx";
import {Outlet} from "react-router";

const AppLayout=() =>  (
    <div className={"relative text-black bg-white grid grid-cols-[auto_1fr] h-screen"}>
        <NavSidebar/>
        <div className={"border-r border-l border-slate-500 h-full"}>
            <ParamsProvider>
                <Outlet />
            </ParamsProvider>
        </div>
    </div>
)

export default AppLayout
