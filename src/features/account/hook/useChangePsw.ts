import {useMutation} from "@tanstack/react-query";
import {pswChange} from "@/features/account/api/userApi.ts";
import toast from "react-hot-toast";

export default function useChangePsw() {

    const changePasswordFunc = useMutation({
        mutationFn: pswChange,
        onSuccess: () => {
            toast.success("Password cambiata con successo")
        },
        onError: () => {
            toast.error("Errore durante il cambio password")
        }
    })

    return {
        changePassword: ({oldPassword, newPassword}: {oldPassword: string, newPassword: string}) => changePasswordFunc.mutate({oldPassword, newPassword})
    }
}