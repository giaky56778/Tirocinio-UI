import { useEffect } from "react";
import toast, { Toaster, useToasterStore } from "react-hot-toast";
import {BrowserRouter, Routes, Route} from "react-router";
import EditorPage from "@/features/double-editor/editorPage.tsx";
import SearchPage from "@/features/search/components/searchPage.tsx";
import VisualizeHighlights from "@/features/view/components/visualizeHighlights.tsx";
import NavSidebar from "@/components/layout/navBar.tsx";
import PreviewDouble from "@/features/preview/previewDouble.tsx";
import PreviewSingle from "@/features/preview/previewSingle.tsx";
import {GlobalStateProvider} from "@/contexts/globalState.tsx";
import ParamsProvider from "@/contexts/paramsProvider.tsx";

export default function App(){
    const { toasts } = useToasterStore()

    const TOAST_LIMIT = 2

    useEffect(() => {
        toasts
            .filter((t) => t.visible)
            .filter((_, i) => i >= TOAST_LIMIT)
            .forEach((t) => toast.dismiss(t.id))
    }, [toasts])

    return (
        <BrowserRouter>
            <GlobalStateProvider>
                <Toaster/>
                <div className={"relative text-black bg-white grid grid-cols-[auto_1fr] h-screen"}>
                    <NavSidebar/>
                    <div className={"border-r border-l border-slate-500 h-full"}>
                        <ParamsProvider>
                            <Routes>
                                <Route path="/"               element={<EditorPage/>} />
                                <Route path="/search"         element={<SearchPage/>} />
                                <Route path="/viewHighlights" element={<VisualizeHighlights/>} />
                                <Route path="/previewDouble"  element={<PreviewDouble/>} />
                                <Route path="/previewSingle"  element={<PreviewSingle/>} />
                            </Routes>
                        </ParamsProvider>
                    </div>
                </div>
            </GlobalStateProvider>
        </BrowserRouter>
    )
}
