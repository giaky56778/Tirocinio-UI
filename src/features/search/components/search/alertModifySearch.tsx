import {type AlertDialog} from "@base-ui/react/alert-dialog";
import {Separator} from "@base-ui/react/separator";
import AlertConfirmDialog from "@/components/ui/common/alertConfirmDialog.tsx";

export type AlertModifyPayloadType = {
    onConfirm: ()=>void
}

type AlertModifySearchProps = {
    alertHandle: AlertDialog.Handle<AlertModifyPayloadType>,
}

const AlertModifySearch = ({alertHandle}: AlertModifySearchProps) => (
    <AlertConfirmDialog
        handle={alertHandle}
        title={"Modifica ricerca"}
        description={"Stai per modificare i parametri della ricerca corrente."}
        confirmText={"Conferma"}
        cancelText={"Annulla"}
    >
        <div className="mx-6 mb-5 rounded-lg border border-slate-300 bg-slate-50 px-4 py-3">
            <div className="text-sm leading-relaxed">
                <span className="font-semibold">Attenzione:</span>
                modificando il testo selezionato di ricerca, i risultati non saranno più collegati a questo specifico
                testo e non sarà possibile salvare le citazioni trovate.
                <Separator
                    orientation="horizontal"
                    className="h-px w-full my-3 bg-neutral-300 dark:bg-neutral-300"
                />
                Confermi di voler modificare la ricerca?
            </div>
        </div>
    </AlertConfirmDialog>
)

export default AlertModifySearch
