import {Link, useLocation} from "react-router";

type PageLabelType = {
    info: string
    label: string
}

export type RouterPageType = '/' | '/search' | '/viewHighlights'

const links:Record<string, PageLabelType> = {
    '/': {
        label:'Editor',
        info:'Prova A'
    },
    '/search':{
        label:'Search',
        info:'Prova B'
    },
    '/viewHighlights': {
        label:'Highlights',
        info:'Prova C'
    },
}

export default function NavSidebar() {
    const {pathname} = useLocation()

    const pageLabel = links[pathname]?.info ?? "Default"
    const isPreviewDouble = pathname === '/previewDouble' || pathname === '/previewSingle'
    const activeLink = isPreviewDouble ? '/' : pathname

    return (
        <div className="col-span-1 flex flex-col h-full">
            <div className={"flex flex-col items-center gap-3 pt-6 border-slate-300 mb-15"}>
                {Object.entries(links).map(([to, item]) => (
                    <Link
                        key={to}
                        to={to}
                        className={`w-4/5 rounded px-2 py-2 text-center text-sm font-medium transition-colors
                            ${activeLink === to
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                        }`}
                        onClick={(e)=>{
                            if (activeLink === to) {
                                e.preventDefault()
                                return
                            }
                        }}
                    >
                        {item.label}
                    </Link>
                ))}
            </div>
            <div className={"mt-auto mb-4 text-xs text-gray-500 border p-2 border-gray-300 h-2/3 w-full"}>
                {pageLabel}
            </div>
            <div className={"mt-auto mb-4 text-xs p-2 text-gray-500"}>
                Account
            </div>
        </div>
    );
}
