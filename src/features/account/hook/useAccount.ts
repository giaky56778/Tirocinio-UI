import {useMutation, useQueryClient, useSuspenseQuery} from "@tanstack/react-query";
import toast from "react-hot-toast";
import {useLocation} from "react-router";
import {useEffect} from "react";
import {logout, me} from "@/features/account/api/userApi.ts";

export default function useAccount(){
    const {pathname} = useLocation()
    const query = useQueryClient()

    useEffect(() => {
        void query.invalidateQueries({queryKey: ['account']})
    }, [pathname, query])

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
        logout: ()=> logoutFunc.mutate()
    }
}