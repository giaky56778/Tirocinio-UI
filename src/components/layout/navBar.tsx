import {Link, useLocation} from "react-router";
import {
    ArrowSvg,
    DocumentIcon,
    ExitIcon,
    OrderListIcon,
    SearchIcon,
    SettingsIcon,
    UserIcon
} from "@/components/ui/icons";
import {Tooltip} from "@base-ui/react/tooltip";
import CommonTooltip from "@/features/search/components/search/commonTooltip.tsx";
import {Dialog, Menu} from "@base-ui/react";
import useAccount from "@/hook/useAccount.ts";
import type {JSX} from "react";

type PageLabelType = {
    label: string
    info:string
    icon: JSX.Element
}

const links:Record<string, PageLabelType> = {
    '/': {
        label:'Editor',
        info:'Editor dei testi',
        icon:<DocumentIcon/>
    },
    '/search':{
        label:'Ricerca',
        info: 'Ricerca nel testo',
        icon:<SearchIcon/>
    },
    '/viewHighlights': {
        label:'Evidenziazioni',
        info: 'Visualizzazione delle evidenziazioni confermate',
        icon:<OrderListIcon/>
    },
}

export default function NavSidebar() {
    const {pathname} = useLocation()
    const account = useAccount()
    const changePasswordHandler = Dialog.createHandle()

    const isPreviewDouble = pathname === '/previewDouble' || pathname === '/previewSingle'
    const activeLink = isPreviewDouble ? '/' : pathname
    const tooltipHandler = Tooltip.createHandle<{text:string}>()

    return (
        <div className="w-16 flex flex-col h-full border-r border-slate-300 bg-slate-50">
            <div className={"flex flex-col items-center gap-3 pt-6 border-slate-300 mb-15"}>
                <Tooltip.Provider>
                    {Object.entries(links).map(([to, item]) => {
                        return (
                            <Tooltip.Trigger
                                key={to}
                                handle={tooltipHandler}
                                payload={{text: item.info}}
                                render={
                                    <Link
                                        to={to}
                                        className={`w-4/5 flex items-center justify-center rounded py-2 font-medium cursor-pointer
                                                ${activeLink === to
                                            ? 'bg-orange-700 text-white font-bold border border-transparent'
                                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                                        }`}
                                        onClick={(e) => {
                                            if (activeLink === to) {
                                                e.preventDefault()
                                                return
                                            }
                                        }}
                                    />
                                }
                            >
                                {item.icon}
                            </Tooltip.Trigger>
                        )
                    })}
                    <CommonTooltip
                        handle={tooltipHandler}
                        position="right"
                    />
                </Tooltip.Provider>
            </div>
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
            <Dialog.Root handle={changePasswordHandler}>
                <Dialog.Portal>
                    <Dialog.Backdrop className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity data-ending-style:opacity-0 z-50"/>
                    <Dialog.Popup className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden p-6 z-50">
                        <Dialog.Title className="text-lg font-bold text-slate-800">Cambia password</Dialog.Title>
                        <Dialog.Description className="text-sm text-slate-500 mt-1">Modifica la tua password</Dialog.Description>
                    </Dialog.Popup>
                </Dialog.Portal>
            </Dialog.Root>
        </div>
    )
}
