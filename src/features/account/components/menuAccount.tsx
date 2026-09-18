import {Dialog, Menu} from "@base-ui/react";
import {ArrowSvg, ExitIcon, SettingsIcon, UserIcon} from "@/components/ui/icons";
import useAccount from "@/features/account/hook/useAccount.ts";
import DialogChangePassword from "@/features/account/components/dialogChangePassword.tsx";

export default function MenuAccount() {
    const account = useAccount()
    const changePasswordHandler = Dialog.createHandle<never>()

    return(
        <>
            <Menu.Root>
                <Menu.Trigger className={"mt-auto mx-auto mb-4 p-2 w-4/5 flex items-center justify-center rounded py-2 transition-colors text-gray-700 hover:bg-gray-100 cursor-pointer"}>
                    <UserIcon className={"size-7"}/>
                </Menu.Trigger>
                <Menu.Portal>
                    <Menu.Positioner
                        className="outline-hidden"
                        sideOffset={8}
                        align="start"
                    >
                        <Menu.Popup className={"w-48 bg-white shadow-lg rounded-md py-1 border border-slate-200 text-base outline-none"}>
                            <div className="px-3 py-2 border-b border-slate-100">
                                <p className="text-xs text-gray-400 font-medium">Utente:</p>
                                <p className="text-sm font-semibold text-slate-800 truncate">{account.getInfoUser.data?.username}</p>
                            </div>
                            <Dialog.Trigger
                                handle={changePasswordHandler}
                                nativeButton={false}
                                render={
                                    <Menu.Item className={"flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 cursor-pointer outline-none"}>
                                        <SettingsIcon className={"size-4"} />
                                        Cambia password
                                    </Menu.Item>
                                }
                            />
                            <Menu.Separator className={"my-1 border-t border-gray-200"}/>
                            <Menu.Item
                                className={"flex items-center gap-2 px-3 py-1.5 hover:bg-red-50 text-red-600 cursor-pointer outline-none"}
                                onClick={account.logout}
                            >
                                <ExitIcon className={"size-4"} />
                                Logout
                            </Menu.Item>
                        </Menu.Popup>
                        <Menu.Arrow
                            className="data-[side=bottom]:-top-2 data-[side=left]:-right-3.25 data-[side=left]:rotate-90 data-[side=right]:-left-3.25 data-[side=top]:-bottom-2"
                            render={ArrowSvg}
                        />
                    </Menu.Positioner>
                </Menu.Portal>
            </Menu.Root>
            <DialogChangePassword changePasswordHandler={changePasswordHandler}/>
        </>
    )
}