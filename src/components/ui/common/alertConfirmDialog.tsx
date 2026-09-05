import {ReactNode, RefObject} from "react";
import {AlertDialog} from "@base-ui/react/alert-dialog";
import {TriangleExclamationIcon} from "@/components/ui/icons";
import DialogCloseCostume from "@/components/ui/common/dialogCloseCostume.tsx";
import {AlertModifyPayloadType} from "@/features/search/components/search/alertModifySearch.tsx";

type Props = {
    handle: RefObject<AlertDialog.Handle<AlertModifyPayloadType>>,
    title: ReactNode,
    description: ReactNode,
    confirmText: string,
    cancelText: string,
    children?: ReactNode,
    onOpenChange?: (open: boolean) => void
}

const AlertConfirmDialog = ({
    handle, title, description, children,
    confirmText = "Conferma",
    cancelText = "Annulla",
    onOpenChange
}: Props) => (

    <AlertDialog.Root
        handle={handle.current}
        onOpenChange={onOpenChange}
    >
        {({payload}) => (
            <AlertDialog.Portal>
                <AlertDialog.Backdrop
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity data-ending-style:opacity-0 data-starting-style:opacity-0"/>
                <AlertDialog.Popup
                    className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden">
                    <DialogCloseCostume/>
                    <div className="flex items-start gap-4 px-6 pt-6 pb-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-800 shrink-0">
                            <TriangleExclamationIcon className="size-7 stroke-white"/>
                        </div>
                        <div>
                            <AlertDialog.Title className="text-base font-semibold text-gray-900">
                                {title}
                            </AlertDialog.Title>
                            {description && (
                                <AlertDialog.Description className="mt-1 text-sm text-gray-500">
                                    {description}
                                </AlertDialog.Description>
                            )}
                        </div>
                    </div>
                    {children}
                    {payload && (
                        <div className="flex items-center justify-end gap-2 px-6 py-4 bg-gray-50 border-t border-gray-100">
                            <AlertDialog.Close
                                type="button"
                                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                                {cancelText}
                            </AlertDialog.Close>
                            <AlertDialog.Close
                                type="button"
                                className="inline-flex items-center justify-center rounded-lg bg-red-800 px-4 py-2 text-sm font-semibold text-white hover:bg-red-900 transition-colors cursor-pointer"
                                onClick={payload.onConfirm}
                            >
                                {confirmText}
                            </AlertDialog.Close>
                        </div>
                    )}
                </AlertDialog.Popup>
            </AlertDialog.Portal>
        )}
    </AlertDialog.Root>
)

export default AlertConfirmDialog
