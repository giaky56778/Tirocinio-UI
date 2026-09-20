import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router";
import toast from "react-hot-toast";
import {login as apiLogin, logoutApi, me, pswChange} from "@/features/account/api/userApi.ts";
import { useAuthStore } from "@/store/authStore.ts";
import { useEffect } from "react";
import type { MeSchema } from "@/api/indexType.ts";

export type AccountType = {
    user: MeSchema | undefined
    getInfoUser: { data: MeSchema | undefined }
    isLoading: boolean
    logout: () => void
    login: ({ username, password }: { username: string; password: string }) => void
    changePassword: ({ oldPassword, newPassword }: { oldPassword: string; newPassword: string }) => void
}

export default function
    useAccount(): AccountType {
    const navigate = useNavigate()
    const location = useLocation()
    const queryClient = useQueryClient()
    const { setAuth, clearAuth } = useAuthStore()

    const savedRedirect = sessionStorage.getItem("redirect_after_login")
    const redirectTo= location.state?.from || savedRedirect || "/"

    const userQuery = useQuery({
        queryKey: ["account"],
        queryFn: me,
        retry: false
    })

    useEffect(() => {
        if (userQuery.data) {
            setAuth(true, userQuery.data)
        }
    }, [userQuery.data, setAuth])

    const loginMutation = useMutation({
        mutationKey: ["login"],
        mutationFn: apiLogin
    })

    const logoutMutation = useMutation({
        mutationKey: ["logout"],
        mutationFn: logoutApi
    })

    function logout() {
        void toast.promise(logoutMutation.mutateAsync(), {
            loading: 'Logout in corso...',
            success: () => {
                clearAuth()
                queryClient.clear()
                //window.location.replace("/login")

                return "Logout effettuato con successo"
            },
            error: 'Errore durante il logout'
        })
    }

    const changePasswordMutation = useMutation({
        mutationKey: ["changePassword"],
        mutationFn: pswChange
    })

    function changePassword({ oldPassword, newPassword }: { oldPassword: string; newPassword: string }) {
        void toast.promise(changePasswordMutation.mutateAsync({ oldPassword, newPassword }), {
            loading: 'Cambio password in corso...',
            success: () => "Password cambiata con successo",
            error: 'Errore durante il cambio password'
        })
    }

    function login({ username, password }: { username: string; password: string }) {
        void toast.promise(loginMutation.mutateAsync({ username, password }),{
            loading: 'Login in corso...',
            success: ()=>{
                sessionStorage.removeItem("redirect_after_login")
                queryClient.clear()
                setAuth(true)
                if (redirectTo === "/login")
                    navigate("/", { replace: true })
                else
                    navigate(redirectTo, { replace: true })

                return "Login effettuato con successo"
            },
            error: 'Errore durante il login'
        })
    }

    return {
        user: userQuery.data,
        getInfoUser: {
            data: userQuery.data,
        },
        isLoading: userQuery.isLoading,
        logout,
        login,
        changePassword
    }
}
