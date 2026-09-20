import {type JSX} from "react";
import {Link, useLocation} from "react-router";
import {DocumentIcon, OrderListIcon, SearchIcon} from "@/components/ui/icons";
import {Tooltip} from "@base-ui/react/tooltip";
import CommonTooltip from "@/features/search/components/search/commonTooltip.tsx";
import MenuAccount from "@/features/account/components/menuAccount.tsx";
import type {AccountType} from "@/features/account/hook/useAccount.ts";

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

export default function NavSidebar({ account }: { account?: AccountType }) {
    const {pathname} = useLocation()

    const isPreviewDouble = pathname === '/previewDouble' || pathname === '/previewSingle'
    const activeLink = isPreviewDouble ? '/' : pathname
    const tooltipHandler = Tooltip.createHandle<{text:string}>()

    return (
        <div className="w-16 flex flex-col h-full border-r border-slate-300 bg-slate-50">
            <div className={"flex flex-col items-center gap-3 pt-6 border-slate-300 mb-15"}>
                <Tooltip.Provider>
                    {Object.entries(links).map(([to, item]) => (
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
                                        }
                                    `}
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
                    )}
                    <CommonTooltip
                        handle={tooltipHandler}
                        position="right"
                    />
                </Tooltip.Provider>
            </div>
            <MenuAccount account={account}/>
        </div>
    )
}
