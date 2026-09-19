import {Button, Dialog} from "@base-ui/react"
import {LockClose} from "@/components/ui/icons";
import {Separator} from "@base-ui/react/separator";
import {Form} from "@base-ui/react/form";
import {useRef} from "react";
import FieldAccount from "@/features/account/components/fieldAccount.tsx";
import useAccount from "@/features/account/hook/useAccount.ts";

type Props={
    changePasswordHandler: Dialog.Handle<never>
}

export default function DialogChangePassword({changePasswordHandler}:Props){
    const showMismatchRef = useRef(false)
    const confirmActionsRef = useRef<{ validate: () => void } | null>(null)
    const { changePassword } = useAccount()
    
    return (
        <Dialog.Root handle={changePasswordHandler}>
            <Dialog.Portal>
                <Dialog.Backdrop className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity data-ending-style:opacity-0 z-50"/>
                <Dialog.Popup className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden p-6 z-50">
                    <Dialog.Title className="text-lg font-bold text-slate-800">Cambia password</Dialog.Title>
                    <Dialog.Description className="text-sm text-slate-500 mt-1">Modifica la tua password</Dialog.Description>
                    <Form
                        onSubmit={(e) => {
                            e.preventDefault()
                            const formData = new FormData(e.target as HTMLFormElement)
                            const oldPassword = formData.get('old_password') as string
                            const newPassword = formData.get('new_password') as string
                            const confirmPassword = formData.get('confirm_password') as string

                            if (newPassword !== confirmPassword) {
                                showMismatchRef.current = true
                                confirmActionsRef.current?.validate()
                                return
                            }
                            showMismatchRef.current = false
                            changePassword({oldPassword, newPassword})
                        }}
                        className="flex flex-col gap-5"
                    >
                        <FieldAccount
                            name={"old_password"}
                            placeholder={"Password attuale"}
                            label={"Password attuale"}
                            validateMode={"onChange"}
                            validateFunction={(value) => {
                                if (!value)
                                    return "Inserisci la password attuale"
                                return null
                            }}
                            icon={<LockClose className="size-5 text-slate-400 shrink-0" />}
                            type="password"
                        />
                        <Separator orientation={"horizontal"} className="h-px w-full bg-slate-200"/>
                        <FieldAccount
                            name={"new_password"}
                            placeholder={"Nuova password"}
                            label={"Nuova password"}
                            validateMode={"onChange"}
                            validateFunction={(value) => {
                                if (!value)
                                    return "Inserisci la nuova password"
                                return null
                            }}
                            icon={<LockClose className="size-5 text-slate-400 shrink-0" />}
                            type={"password"}
                            onChangeControl={() => {
                                if (showMismatchRef.current) {
                                    showMismatchRef.current = false
                                    confirmActionsRef.current?.validate()
                                }
                            }}
                        />
                        <FieldAccount
                            name={"confirm_password"}
                            placeholder={"Conferma password"}
                            label={"Conferma password"}
                            validateMode={"onChange"}
                            validateFunction={(value) => {
                                if(showMismatchRef.current)
                                    return "Le password non corrispondono"
                                if (!value)
                                    return "Re-inserisci la nuova password"
                                return null
                            }}
                            icon={<LockClose className="size-5 text-slate-400 shrink-0" />}
                            type={"password"}
                            actionsRef={confirmActionsRef}
                            onChangeControl={() => {
                                if (showMismatchRef.current) {
                                    showMismatchRef.current = false
                                    confirmActionsRef.current?.validate()
                                }
                            }}
                        />
                        <Button
                            type="submit"
                            className="mx-auto flex items-center justify-center mt-2 w-full py-2.5 px-4 bg-orange-700 hover:bg-orange-800 text-white font-medium text-sm rounded-lg shadow transition-colors duration-200 focus:ring-2 focus:ring-orange-600 cursor-pointer"
                        >
                            Modifica password
                        </Button>
                    </Form>
                </Dialog.Popup>
            </Dialog.Portal>
        </Dialog.Root>
    )
}
