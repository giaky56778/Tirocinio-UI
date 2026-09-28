import {Navigate, Outlet, useLocation} from "react-router";
import {useAuthStore} from "@/store/authStore.ts";
import {LoadingSpinner} from "@/components/ui/icons";
import NavSidebar from "@/components/layout/navBar.tsx";
import ParamsProvider from "@/contexts/paramsProvider.tsx";
import {useQuery} from "@tanstack/react-query";
import {me} from "@/features/account/api/userApi.ts";

export default function Protected() {
    const location = useLocation()
    const { isAuthenticated } = useAuthStore()

    const checkIsLogged = useQuery({
        queryKey: ["account"],
        queryFn: me
    })

    if ((isAuthenticated === null && !checkIsLogged.data) || checkIsLogged.isLoading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-white">
                <LoadingSpinner className="size-8 text-orange-600 animate-spin" />
            </div>
        )
    }

    if ((!isAuthenticated && !checkIsLogged.data) || checkIsLogged.isError) {
        return (
            <Navigate
                to="/login"
                replace
                state={{
                    from: location.pathname + location.search
                }}
            />
        )
    }

    return (
        <div className="relative text-black bg-white grid grid-cols-[auto_1fr] h-screen">
            <NavSidebar />
            <div className="border-r border-l border-slate-500 h-full">
                <ParamsProvider>
                    <Outlet/>
                </ParamsProvider>
            </div>
        </div>
    )
}
