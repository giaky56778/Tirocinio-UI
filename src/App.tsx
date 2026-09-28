import {useEffect} from "react";
import toast, {Toaster, useToasterStore} from "react-hot-toast";
import {BrowserRouter, Navigate, Route, Routes} from "react-router";
import LoginPage from "@/features/account/components/loginPage.tsx";
import EditorPage from "@/features/double-editor/editorPage.tsx";
import SearchPage from "@/features/search/components/searchPage.tsx";
import VisualizeHighlights from "@/features/view/components/visualizeHighlights.tsx";
import PreviewDouble from "@/features/preview/previewDouble.tsx";
import PreviewSingle from "@/features/preview/previewSingle.tsx";
import Protected from "@/components/layout/protected.tsx";

export default function App() {
    const { toasts } = useToasterStore();
    const TOAST_LIMIT = 2;

    useEffect(() => {
        toasts
            .filter((t) => t.visible)
            .filter((_, i) => i >= TOAST_LIMIT)
            .forEach((t) => toast.dismiss(t.id))
    }, [toasts])

    return (
        <BrowserRouter>
            <Toaster />
            <Routes>
                <Route path="/login" element={<LoginPage/>} />
                <Route element={<Protected/>}>
                    <Route path="/" element={<EditorPage/>} />
                    <Route path="/search" element={<SearchPage/>} />
                    <Route path="/viewHighlights" element={<VisualizeHighlights/>} />
                    <Route path="/previewDouble" element={<PreviewDouble/>} />
                    <Route path="/previewSingle" element={<PreviewSingle/>} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    )
}
