import toast from "react-hot-toast";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {useLocation, useNavigate} from "react-router";
import {login as apiLogin, logoutApi, pswChange} from "@/features/account/api/userApi.ts";
import {useAuthStore} from "@/store/authStore.ts";

export type UserActions = {
    logout: () => void
    login: ({ username, password }: { username: string; password: string }) => void
    changePassword: ({ oldPassword, newPassword }: { oldPassword: string; newPassword: string }) => void
}

export default function useAccountFunction(): UserActions {
    const navigate = useNavigate()
    const location = useLocation()
    const queryClient = useQueryClient()
    const { setAuth, clearAuth, redirectUrl, clearRedirectUrl } = useAuthStore()

    const redirectTo = location.state?.from || redirectUrl || "/"

    const logoutMutation = useMutation({
        mutationKey: ["logout"],
        mutationFn: logoutApi
    })

    const changePasswordMutation = useMutation({
        mutationKey: ["changePassword"],
        mutationFn: pswChange
    })

    const loginMutation = useMutation({
        mutationKey: ["login"],
        mutationFn: apiLogin
    })

    function logout() {
        void toast.promise(logoutMutation.mutateAsync(), {
            loading: 'Logout in corso...',
            success: () => {
                clearAuth()
                clearRedirectUrl()
                queryClient.clear()

                return "Logout effettuato con successo"
            },
            error: 'Errore durante il logout'
        })
    }

    function changePassword({ oldPassword, newPassword }: { oldPassword: string; newPassword: string }) {
        void toast.promise(changePasswordMutation.mutateAsync({ oldPassword, newPassword }), {
            loading: 'Cambio password in corso...',
            success: "Password cambiata con successo",
            error: 'Errore durante il cambio password'
        })
    }

    function login({ username, password }: { username: string; password: string }) {
        void toast.promise(loginMutation.mutateAsync({ username, password }),
            {
                success: ()=>{
                    const target = redirectTo === "/login" ? "/" : redirectTo
                    clearRedirectUrl()
                    queryClient.clear()

                    setAuth(true, {username:username})
                    navigate(target, { replace: true })

                    return "Login effettuato con successo"
                },
                loading: 'Login in corso...',
                error: 'Errore durante il login'
            }
        )
    }

    return {
        logout,
        login,
        changePassword
    }
}
