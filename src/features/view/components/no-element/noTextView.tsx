import {DocumentIcon} from "@/components/ui/icons";
import {useNavigate} from "react-router";

export default function NoTextView() {
    const navigate = useNavigate()

    return (
        <div className="flex flex-col items-center justify-center h-full p-6 bg-slate-50/50">
            <div className="max-w-md w-full text-center bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                <div
                    className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-orange-50 text-orange-600 mb-5 shadow-inner">
                    <DocumentIcon/>
                </div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                    Nessun testo disponibile
                </h2>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                    Non è stato ancora caricato alcun testo biblico. Carica un testo nell'Editor per poter analizzare e
                    visualizzare le evidenziazioni collegate.
                </p>
                <button
                    onClick={() => navigate('/')}
                    className="mt-6 inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-orange-700 rounded-lg hover:bg-orange-800 transition-colors shadow-sm cursor-pointer"
                >
                    Vai all'Editor
                </button>
            </div>
        </div>
    )
}