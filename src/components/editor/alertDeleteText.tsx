import {AlertDialog} from "@base-ui/react/alert-dialog";
import {TriangleExclamationIcon} from "@/components/icons";
import {RefObject} from "react";
import {TextSelectedType} from "@/hooks/useTextNameSelection.ts";
import {useDeleteBiblicalText} from "@/hooks/useOtherTextQuery.ts";
import {TextListSchema} from "@/utils/JSONSchema.ts";
import DialogCloseCostume from "@/components/common/dialogCloseCostume.tsx";

type Props={
    alert: RefObject<AlertDialog.Handle<{id: number}>>
    textNameSelect: TextSelectedType
    textNames: TextListSchema
    onChange:(newSelected: TextSelectedType) => void
    blockSelectedRef?: RefObject<boolean>
}

const AlertDeleteText =({alert,textNameSelect,textNames,onChange,blockSelectedRef}: Props)=> {
    const useDelete=useDeleteBiblicalText()

    function handleConfirmDelete(id:number) {
        if (id === textNameSelect.items.id) {
            let firstRemainingItem: TextSelectedType | undefined

            for (const group of textNames) {
                const item = group.items.find(i => i.id !== id)
                if (item) {
                    firstRemainingItem = {
                        path: group.path,
                        items: item
                    }
                    break
                }
            }

            if (firstRemainingItem) {
                onChange(firstRemainingItem)
            }
        }
        useDelete.mutate({ id })
    }


    return (
        <AlertDialog.Root
            handle={alert.current}
            onOpenChange={(isOpen) => {
                if (blockSelectedRef)
                    blockSelectedRef.current = isOpen
            }}
        >
            {({ payload }) => (
                <AlertDialog.Portal>
                    <AlertDialog.Backdrop className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity data-ending-style:opacity-0"/>
                    <AlertDialog.Popup className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden">
                        <DialogCloseCostume/>
                        <div className="flex items-start gap-4 px-6 pt-6 pb-4">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-800 shrink-0">
                                <TriangleExclamationIcon className={'size-7 stroke-white'}/>
                            </div>
                            <div>
                                <AlertDialog.Title className="text-base font-semibold text-gray-900">
                                    Cancella Testo
                                </AlertDialog.Title>
                                <AlertDialog.Description className="mt-1 text-sm text-gray-500">
                                    Stai per eliminare il testo di ricerca corrente.
                                </AlertDialog.Description>
                            </div>
                        </div>

                        <div className="mx-6 mb-5 rounded-lg border border-slate-300 bg-slate-50 px-4 py-3">
                            <p className="text-sm  leading-relaxed">
                                Sei sicuro di voler eliminare il testo? L'operazione non è reversibile.
                            </p>
                        </div>

                        <div className="flex items-center justify-end gap-2 px-6 py-4 bg-gray-50 border-t border-gray-100">
                            <AlertDialog.Close
                                type="button"
                                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                                Annulla
                            </AlertDialog.Close>
                            <AlertDialog.Close
                                type="button"
                                className="inline-flex items-center justify-center rounded-lg bg-red-800 px-4 py-2 text-sm font-semibold text-white hover:bg-red-900 transition-colors"
                                onClick={() => {
                                    if (payload) handleConfirmDelete(payload.id)
                                }}
                            >
                                Conferma
                            </AlertDialog.Close>
                        </div>
                    </AlertDialog.Popup>
                </AlertDialog.Portal>
            )}
        </AlertDialog.Root>
    )
}

export default AlertDeleteText
