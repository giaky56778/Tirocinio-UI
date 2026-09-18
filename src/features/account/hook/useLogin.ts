import {useMutation, useQueryClient} from "@tanstack/react-query";
import {login} from "@/features/account/api/userApi.ts";
import {useLocation, useNavigate} from "react-router";
import toast from "react-hot-toast";

export default function useLogin() {
    const navigate = useNavigate()
    const location = useLocation()
    const queryClient = useQueryClient()
    const redirectTo = location.state?.from || '/'

    const loginMutation = useMutation({
        mutationFn: login,
        onSuccess: () => {
            queryClient.clear()
            toast.success("Login effettuato con successo")
            if(redirectTo === '/login') {
                navigate('/', { replace: true })
                return
            }
            navigate(redirectTo, { replace: true })
        },
        onError: (error: Error) => {
            toast.error(error.message)
        }
    })

    return {
        login: ({username, password}: {username: string, password: string}) => loginMutation.mutate({username, password})
    }
}