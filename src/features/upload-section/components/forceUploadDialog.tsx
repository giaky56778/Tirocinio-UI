import { Dialog } from "@base-ui/react";
import UploadTextForm from "@/features/upload-section/components/uploadTextForm.tsx";
import { TextSelectedType } from "@/hook/useTextNameSelection.ts";
import {UploadIcon} from "@/components/ui/icons";

interface ForceUploadDialogProps {
    selectText: (newSelected: TextSelectedType) => void
}

const ForceUploadDialog = ({ selectText }: ForceUploadDialogProps) => (
    <Dialog.Root open modal>
        <Dialog.Portal>
            <Dialog.Backdrop className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-200 data-ending-style:opacity-0" />
            <Dialog.Popup className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none data-ending-style:opacity-0 data-ending-style:scale-95">
                <div className="flex items-start gap-4 px-6 pt-6 pb-5 border-b border-slate-100 bg-linear-to-r from-orange-50/80 via-indigo-50/40 to-white">
                    <header className="flex items-center justify-center w-12 h-12 rounded-xl bg-orange-600 text-white shrink-0 shadow-md shadow-orange-500/20">
                        <UploadIcon/>
                    </header>
                    <div className="flex-1 pt-0.5">
                        <h2 className="text-lg font-bold text-slate-900 leading-snug">
                            Carica un testo
                        </h2>
                        <p className="mt-1 text-sm text-slate-500 leading-relaxed">
                            Non ci sono ancora testi salvati. Aggiungi almeno un file TEI/XML o TXT per iniziare.
                        </p>
                    </div>
                </div>
                <div className="px-6 py-6 bg-white">
                    <UploadTextForm onTextChange={selectText} />
                </div>
            </Dialog.Popup>
        </Dialog.Portal>
    </Dialog.Root>
);

export default ForceUploadDialog
