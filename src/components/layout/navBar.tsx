import {JSX, useRef} from "react";
import {Link, useLocation} from "react-router";
import {ArrowSvg, SettingsIcon, DocumentIcon, ExitIcon, OrderListIcon, SearchIcon, UserIcon} from "@/components/ui/icons";
import {Tooltip} from "@base-ui/react/tooltip";
import CommonTooltip from "@/features/search/components/search/commonTooltip.tsx";
import {Menu} from "@base-ui/react";

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

    const isPreviewDouble = pathname === '/previewDouble' || pathname === '/previewSingle'
    const activeLink = isPreviewDouble ? '/' : pathname
    const tooltipHandler = useRef(Tooltip.createHandle<{text:string}>())

    return (
        <div className="w-16 flex flex-col h-full border-r border-slate-300 bg-slate-50">
            <div className={"flex flex-col items-center gap-3 pt-6 border-slate-300 mb-15"}>
                <Tooltip.Provider>
                    {Object.entries(links).map(([to, item]) => (
                            <Tooltip.Trigger
                                key={to}
                                handle={tooltipHandler.current}
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
                    ))}
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
                            <Menu.Item className={"flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 cursor-pointer outline-none"}>
                                <SettingsIcon className={"size-4"} />
                                Impostazioni
                            </Menu.Item>
                            <Menu.Separator className={"my-1 border-t border-gray-200"}/>
                            <Menu.Item className={"flex items-center gap-2 px-3 py-1.5 hover:bg-red-50 text-red-600 cursor-pointer outline-none"}>
                                <ExitIcon className={"size-4"} />
                                Logout
                            </Menu.Item>
                        </Menu.Popup>
                        <Menu.Arrow
                            className="data-[side=bottom]:-top-2 data-[side=left]:-right-3.25 data-[side=left]:rotate-90 data-[side=right]:-left-3.25 data-[side=right]:-rotate-90 data-[side=top]:-bottom-2 data-[side=top]:rotate-180"
                            render={ArrowSvg}
                        />
                    </Menu.Positioner>
                </Menu.Portal>
            </Menu.Root>
        </div>
    )
}
