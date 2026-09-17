import {createBrowserRouter} from "react-router";
import EditorPage from "@/features/double-editor/editorPage.tsx";
import SearchPage from "@/features/search/components/searchPage.tsx";
import VisualizeHighlights from "@/features/view/components/visualizeHighlights.tsx";
import PreviewDouble from "@/features/preview/previewDouble.tsx";
import PreviewSingle from "@/features/preview/previewSingle.tsx";
import LoginPage from "@/features/account/loginPage.tsx";
import AppLayout from "@/components/ui/appLayout.tsx";

export const router = createBrowserRouter([
    {
        path: "/login",
        element: <LoginPage/>
    },
    {
        element: <AppLayout/>,
        children: [
            { path: "/", element: <EditorPage/> },
            { path: "/search", element: <SearchPage/> },
            { path: "/viewHighlights",element: <VisualizeHighlights/> },
            { path: "/previewDouble", element: <PreviewDouble/> },
            { path: "/previewSingle", element: <PreviewSingle/> }
        ]
    }
])