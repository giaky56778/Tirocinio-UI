import {useState} from "react";
import {Button} from "@base-ui/react";
import {Form} from "@base-ui/react/form";
import {LoadingSpinner, LockClose, UserIcon} from "@/components/ui/icons";
import FieldAccount from "@/features/account/components/fieldAccount.tsx";
import useAccountFunction from "@/features/account/hook/useAccountFunction.ts";
import {useAuthStore} from "@/store/authStore.ts";
import {Navigate} from "react-router";
import toast from "react-hot-toast";
import {useQuery} from "@tanstack/react-query";
import {me} from "@/features/account/api/userApi.ts";

export default function LoginPage() {
    const [isLoggingIn, setIsLoggingIn] = useState(false)
    const {login} = useAccountFunction()
    const { isAuthenticated, setAuth } = useAuthStore()

    const checkIsLogged = useQuery({
        queryKey: ["account"],
        queryFn: me
    })

    if(checkIsLogged.isLoading)
        return(
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
                <LoadingSpinner className="size-6 text-orange-600"/>
            </div>
        )

    if ((isAuthenticated && !isLoggingIn) || (checkIsLogged.data && !isLoggingIn)) {
        toast.error("Sei già autenticato, verrai reindirizzato all'editor",{id:"already_authenticated"})
        setAuth(true, checkIsLogged.data)
        return (
            <Navigate to={ "/" } replace/>
        )
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-8 sm:p-10">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                        Login
                    </h1>
                </div>

                <Form
                    onSubmit={(e) => {
                        e.preventDefault()
                        setIsLoggingIn(true)
                        const formData = new FormData(e.target)
                        const username = formData.get('username') as string
                        const password = formData.get('password') as string
                        login({username, password})
                    }}
                    className="flex flex-col gap-5"
                >
                    <FieldAccount
                        name="username"
                        placeholder="Username"
                        label="Username"
                        validateMode="onChange"
                        validateFunction={(value) => {
                            if (!value)
                                return "Inserisci un nome utente"
                            return null
                        }}
                        icon={<UserIcon className="size-5 text-slate-400 shrink-0" />}
                        type="text"
                    />
                    <FieldAccount
                        name="password"
                        placeholder="Password"
                        label="Password"
                        validateMode="onChange"
                        validateFunction={(value) => {
                            if (!value)
                                return "Inserisci una password"
                            return null
                        }}
                        icon={<LockClose className="size-5 text-slate-400 shrink-0" />}
                        type="password"
                    />

                    <Button
                        type="submit"
                        className="mx-auto flex items-center justify-center mt-2 w-full py-2.5 px-4 bg-orange-700 hover:bg-orange-800 text-white font-medium text-sm rounded-lg shadow transition-colors duration-200 focus:ring-2 focus:ring-orange-600 cursor-pointer"
                    >
                        Accedi
                    </Button>
                </Form>
            </div>
        </div>
    )
}
