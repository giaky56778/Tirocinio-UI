import {useEffect} from "react";
import toast, {Toaster, useToasterStore} from "react-hot-toast";
import {RouterProvider} from "react-router";
import {router} from "@/utils/router.tsx";

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
        <>
            <Toaster/>
            <RouterProvider router={router} />
        </>
    )
}
