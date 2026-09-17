import {Button, Field} from "@base-ui/react";
import {Form} from "@base-ui/react/form";
import {LockClose, UserIcon} from "@/components/ui/icons";
import {Separator} from "@base-ui/react/separator";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import toast from "react-hot-toast";
import {useNavigate, useLocation} from "react-router";
import {login} from "@/api";

export default function LoginPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const queryClient = useQueryClient()
    const redirectTo = location.state?.from || '/'

    const loginMutation = useMutation({
        mutationFn: login,
        onSuccess: (data) => {
            queryClient.clear()
            toast.success("Accesso effettuato!")
            console.log(data)
            navigate(redirectTo, { replace: true })
        },
        onError: (error: Error) => {
            toast.error(error.message)
        }
    })

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
                        const formData = new FormData(e.target)
                        const username = formData.get('username') as string
                        const password = formData.get('password') as string
                        loginMutation.mutate({username, password})
                    }}
                    className="flex flex-col gap-5">
                    <Field.Root
                        name="username"
                        className="flex flex-col gap-1.5 h-20"
                        validationMode="onChange"
                        validate={(value) => {
                            if (!value)
                                return "Inserisci un nome utente"
                            return null
                        }}
                    >
                        <Field.Label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            Username
                        </Field.Label>
                        <div className="flex items-center gap-3 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus-within:ring-2 focus-within:ring-orange-600/20">
                            <UserIcon className="size-5 text-slate-400 shrink-0" />
                            <Separator orientation={"vertical"} className="h-5 w-px bg-slate-300"/>
                            <Field.Control
                                placeholder="Username"
                                className="w-full text-sm text-slate-800 bg-transparent outline-none"
                            />
                        </div>
                        <Field.Error className="text-xs text-red-600" />
                    </Field.Root>
                    <Field.Root
                        name="password"
                        className="flex flex-col gap-1.5 h-20"
                        validationMode="onChange"
                        validate={(value) => {
                            if (!value)
                                return "Inserisci una password"
                            return null
                        }}
                    >
                        <Field.Label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            Password
                        </Field.Label>
                        <div className="flex items-center gap-3 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus-within:ring-2 focus-within:ring-orange-600/20">
                            <LockClose className="size-5 text-slate-400 shrink-0" />
                            <Separator orientation={"vertical"} className="h-5 w-px bg-slate-300"/>
                            <Field.Control
                                type="password"
                                placeholder="Password"
                                className="w-full text-sm text-slate-800 bg-transparent outline-none"
                            />
                        </div>
                        <Field.Error className="text-xs text-red-600" />
                    </Field.Root>

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
