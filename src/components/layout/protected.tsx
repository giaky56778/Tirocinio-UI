import { Navigate, Outlet, useLocation } from "react-router";
import { useAuthStore } from "@/store/authStore.ts";
import { LoadingSpinner } from "@/components/ui/icons";
import useAccount from "@/features/account/hook/useAccount.ts";

export default function Protected() {
    const location = useLocation()
    const {isAuthenticated} = useAuthStore()
    const account = useAccount()

    if (isAuthenticated === null && account.isLoading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-white">
                <LoadingSpinner className="size-8 text-orange-600 animate-spin" />
            </div>
        )
    }

    if (isAuthenticated === false) {
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

    return <Outlet context={account} />
}

