import {useMutation, useQueryClient, useSuspenseQuery} from "@tanstack/react-query";
import {logout, me, pswChange} from "@/api";
import toast from "react-hot-toast";
import {useLocation} from "react-router";
import {useEffect} from "react";

export default function useAccount(){
    const {pathname} = useLocation()
    const query = useQueryClient()

    useEffect(() => {
        void query.invalidateQueries({queryKey: ['account']})
    }, [pathname, query])

    const changePasswordFunc=useMutation({
        mutationFn:pswChange,
        onSuccess:() => {
            toast.success("Password cambiata con successo!")
        },
        onError:() => {
            toast.error("Errore durante il cambio password")
        }
    })

    const logoutFunc=useMutation({
        mutationFn:logout,
        onSuccess:() => {
            window.location.href="/login"
        },
        onError:() => {
            toast.error("Errore durante il logout")
        }
    })

    const userQuery = useSuspenseQuery({
        queryKey: ["account"],
        queryFn: me
    })

    return{
        user: userQuery.data,
        getInfoUser: {
            data: userQuery.data,
        },
        logout: ()=> logoutFunc.mutate(),
        changePassword: ({oldPassword,newPassword}:{oldPassword:string,newPassword:string})=>changePasswordFunc.mutate({oldPassword,newPassword})
    }
}