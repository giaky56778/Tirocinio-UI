import {Dialog} from "@base-ui/react/dialog";
import {ReactNode} from "react";
import DialogCloseCostume from "@/components/common/dialogCloseCostume.tsx";

type Props={
    children: ReactNode
    previewText?:string|null
}

export default function DialogPortalPreview({children,previewText}:Props){
    return (
        <Dialog.Portal>
            <Dialog.Backdrop className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity duration-200 data-starting-style:opacity-0 data-ending-style:opacity-0"/>
            <Dialog.Viewport className="fixed inset-0 flex items-center justify-center p-6 pointer-events-none">
                <Dialog.Popup className="pointer-events-auto relative grid grid-rows-[auto_1fr] w-full max-w-5xl h-[88vh] bg-white rounded-xl shadow-2xl ring-1 ring-black/8 overflow-hidden transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none data-starting-style:opacity-0 data-starting-style:scale-95 data-ending-style:opacity-0 data-ending-style:scale-95">
                    <DialogCloseCostume/>
                    <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-gray-50">
                        <span className="text-sm font-medium text-gray-700 truncate">
                            Anteprima
                            {previewText !== undefined
                                ? (<span className="ml-2 text-xs text-gray-500">
                                        Testo ricercato:&nbsp;
                                        <span className="font-semibold bg-amber-100">{previewText}</span>
                                    </span>
                                )
                                : ""}
                        </span>
                    </div>
                    {children}
                </Dialog.Popup>
            </Dialog.Viewport>
        </Dialog.Portal>
    )
}

