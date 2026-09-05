import {DocumentIcon} from "@/components/ui/icons";
import {useNavigate} from "react-router";
import {TextSelectedType} from "@/hook/useTextNameSelection.ts";

type Props={
    selected: TextSelectedType
}

export default function NoHighlightsShow({selected}:Props) {
    const navigate=useNavigate()
    return(
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50/50">
            <div className="max-w-md w-full text-center bg-white border border-slate-200/80 rounded-2xl p-8 shadow-xs">
                <div className="mx-auto flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 mb-4 ring-8 ring-amber-50/40">
                    <DocumentIcon className="size-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                    Nessuna evidenziazione trovata
                </h3>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                    Il testo <b className="text-slate-700">"{selected?.items.filename}"</b> non contiene ancora evidenziazioni o collegamenti salvati.
                </p>
                <button
                    onClick={() => navigate('/')}
                    className="mt-6 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                    Torna all'Editor
                </button>
            </div>
        </div>
    )
}
