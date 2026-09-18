import {createBrowserRouter, Outlet} from "react-router";
import EditorPage from "@/features/double-editor/editorPage.tsx";
import SearchPage from "@/features/search/components/searchPage.tsx";
import VisualizeHighlights from "@/features/view/components/visualizeHighlights.tsx";
import PreviewDouble from "@/features/preview/previewDouble.tsx";
import PreviewSingle from "@/features/preview/previewSingle.tsx";
import LoginPage from "@/features/account/components/loginPage.tsx";
import {SelectionStoreProvider} from "@/features/editor/store/useSelectionStore.tsx";
import NavSidebar from "@/components/layout/navBar.tsx";
import ParamsProvider from "@/contexts/paramsProvider.tsx";

export const router = createBrowserRouter([
    {
        path: "/login",
        element: <LoginPage/>
    },
    {
        element: (
            <SelectionStoreProvider>
                <div className={"relative text-black bg-white grid grid-cols-[auto_1fr] h-screen"}>
                    <NavSidebar/>
                    <div className={"border-r border-l border-slate-500 h-full"}>
                        <ParamsProvider>
                            <Outlet />
                        </ParamsProvider>
                    </div>
                </div>
            </SelectionStoreProvider>
        ),
        children: [
            { path: "/", element: <EditorPage/> },
            { path: "/search", element: <SearchPage/> },
            { path: "/viewHighlights",element: <VisualizeHighlights/> },
            { path: "/previewDouble", element: <PreviewDouble/> },
            { path: "/previewSingle", element: <PreviewSingle/> }
        ]
    }
])