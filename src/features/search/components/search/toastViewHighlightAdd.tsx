import toast, {type Toast} from "react-hot-toast";
import {useGlobalState} from "@/store/globalStateStore.tsx";
import {OFFSET_SCROLL} from "@/utils/settings.ts";
import {type AddType} from "@/features/search/hooks/useApiSearch.ts";
import {useNavigate} from "react-router";

interface ToastViewHighlightAddProps {
    toastParam: Toast
    value: AddType
}

export default function ToastViewHighlightAdd({ toastParam, value }: ToastViewHighlightAddProps) {
    const t=toastParam
    const globalState= useGlobalState()
    const navigate = useNavigate()

    return (
        <div
            className={`${
                t.visible ? 'animate-custom-enter' : 'animate-custom-leave'
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

                        globalState.setEditor({
                            historical: {
                                path: value.forToast.b_path,
                                items: {
                                    filename: value.forToast.b_filename,
                                    id: value.newHighlight.h_id_text
                                }
                            },
                            biblical: {
                                path: value.forToast.h_path,
                                items: {
                                    filename: value.forToast.h_filename,
                                    id: value.forToast.b_id
                                }
                            },
                            linePos: {
                                historical: value.forToast.line_start_h-OFFSET_SCROLL,
                                biblical: value.newHighlight.line_start_b-OFFSET_SCROLL
                            }
                        })

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