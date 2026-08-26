import { useEffect } from "react";
import toast, { Toaster, useToasterStore } from "react-hot-toast";
import {BrowserRouter, Routes, Route} from "react-router";
import EditorPage from "@/components/page/editorPage.tsx";
import SearchPage from "@/components/page/searchPage.tsx";
import VisualizeHighlights from "@/components/page/visualizeHighlights.tsx";
import NavSidebar from "@/components/navBar.tsx";
import PreviewDouble from "@/components/page/previewDouble.tsx";
import PreviewSingle from "@/components/page/previewSingle.tsx";
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
                <div className={"relative text-black bg-white grid grid-cols-9 h-screen"}>
                    <NavSidebar/>
                    <div className={"col-span-8 border-r border-l  border-slate-500 h-full"}>
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
