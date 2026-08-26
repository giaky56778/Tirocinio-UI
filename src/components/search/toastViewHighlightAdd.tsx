import {useNavigate} from "react-router";
import toast, {Toast} from "react-hot-toast";
import {AddNewHighlightsType} from "@/api";
import {useGlobalState} from "@/contexts/globalState.tsx";

interface ToastViewHighlightAddProps {
    toastParam: Toast
    value: AddNewHighlightsType
}

export default function ToastViewHighlightAdd({ toastParam, value }: ToastViewHighlightAddProps) {
    const t=toastParam
    const navigate = useNavigate()
    const globalState= useGlobalState()

    return (
        <div
            className={`${
                t.visible ? 'animate-enter' : 'animate-leave'
            } max-w-md w-full bg-white shadow-lg rounded-xl pointer-events-auto flex items-center justify-between p-3.5 ring-1 ring-black/5 gap-3 transition-all`}
        >
            <div className="flex items-center gap-3 min-w-0 flex-1">
                <div
                    className="shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                    </svg>
                </div>
                <p className="text-sm font-medium text-gray-800  truncate">
                    Evidenziazione salvata!
                </p>
            </div>
            <div className="flex items-center border-l border-gray-200 pl-3 shrink-0">
                <button
                    onClick={() => {
                        toast.dismiss("toastViewHighlightAdd")

                        globalState.editorRef.current= {
                            biblical: {
                                path: value.forToast.b_path,
                                items: {
                                    filename: value.forToast.b_filename,
                                    id: value.newHighlight.b_id_text
                                }
                            },
                            historical: {
                                path: value.forToast.h_path,
                                items: {
                                    filename: value.forToast.h_filename,
                                    id: value.forToast.h_id
                                }
                            },
                            linePos: {
                                biblical: value.forToast.line_start_b-2,
                                historical: value.newHighlight.line_start_h-2
                            }
                        }
                        globalState.confirmExit()

                        navigate(`/`)
                    }}
                    className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 transition-colors cursor-pointer"
                >
                    Vedi
                </button>
            </div>
        </div>
    )
}