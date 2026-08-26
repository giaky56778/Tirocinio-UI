import {RefObject} from "react";
import {AlertDialog} from "@base-ui/react/alert-dialog";
import AlertConfirmDialog from "@/components/common/alertConfirmDialog.tsx";

type AlertModifySearchProps={
    resetSearchElement: () => void,
    alertHandle:  RefObject<AlertDialog.Handle<any>>
}

const AlertModifySearch = ({
    resetSearchElement,
    alertHandle
}: AlertModifySearchProps) => (
    <AlertConfirmDialog
        handle={alertHandle}
        title={"Modifica ricerca"}
        description={"Stai per modificare i parametri della ricerca corrente."}
        confirmText={"Conferma"}
        cancelText={"Annulla"}
        onConfirm={() => {
            alertHandle.current.close()
            resetSearchElement()
        }}
    >
        <div className="mx-6 mb-5 rounded-lg border border-slate-300 bg-slate-50 px-4 py-3">
            <p className="text-sm  leading-relaxed">
                <span className="font-semibold">Attenzione:</span> modificando il testo di ricerca, i risultati
                non saranno più collegati a <span className="font-medium">searchElement</span>. Il backend si
                comporterà in modo differente e non sarà possibile salvare gli highlight restituiti dalla query
                corrente.
            </p>
        </div>
    </AlertConfirmDialog>
)

export default AlertModifySearch
