import {Dialog} from "@base-ui/react/dialog";
import {ExpandIcon} from "@/components/icons";
import DialogPortalPreview from "@/components/preview/dialogPortalPreview.tsx";
import DoubleResultViewReadOnly from "@/components/preview/doubleResultViewReadOnly.tsx";
import {LINE_EXTRACT_LOWER, LINE_EXTRACT_UPPER} from "@/utils/globalType.ts";
import {AddNewHighlightsType, SingleSearchType} from "@/api";
import {SearchType} from "@/components/reducer/selectionReducer.ts";
import {EditorTextType} from "@/components/page/editorPage.tsx";
import {UseMutationResult} from "@tanstack/react-query";
import {findLineIdByWordId} from "@/utils/util.ts";

type Props = {
    item: SingleSearchType,
    confirmedSearch: SearchType,
    biblicalText: EditorTextType,
    lineBiblical: number,
    isFree: boolean,
    addNewHighlightMutation: UseMutationResult<void, Error, AddNewHighlightsType, unknown>
}

const DoubleCard=({item, confirmedSearch, biblicalText, lineBiblical, isFree, addNewHighlightMutation}: Props)=>(
    <>
        <Dialog.Root>
            <Dialog.Trigger className="shrink-0 inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-800 transition-colors duration-100 select-none focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-orange-600">
                <ExpandIcon className="size-6"/>
                Anteprima
            </Dialog.Trigger>
            <DialogPortalPreview>
                <div  className="min-h-0 overflow-hidden">
                    <DoubleResultViewReadOnly
                        bLine={lineBiblical}
                        bSearch={confirmedSearch!}
                        biblicalText={{
                            ...biblicalText,
                            text: biblicalText.text.slice(Math.max(0, lineBiblical - LINE_EXTRACT_LOWER + 1), lineBiblical + LINE_EXTRACT_UPPER + 1),
                        }}
                        h={`${item.text.source}:${item.range!.startLine}`}
                        b_range={{
                            startWord: confirmedSearch?.selection?.start!,
                            endWord: confirmedSearch?.selection?.end!
                        }}
                        h_range={{
                            startWord: item.range!.startWordId,
                            endWord: item.range!.endWordId
                        }}
                    />
                </div>
            </DialogPortalPreview>
        </Dialog.Root>
        <button
            disabled={!isFree || addNewHighlightMutation.isPending}
            onClick={() => {
                const spl=item.text.source.split('.')
                const last=spl.pop()
                addNewHighlightMutation.mutate({
                    newHighlight: {
                        urn_h: item.text.source,
                        start_h: item.range?.startWordId!,
                        end_h: item.range?.endWordId!,
                        line_start_h: item.range?.startLine!,

                        b_id_text: confirmedSearch?.id!,
                        start_b: confirmedSearch?.selection?.start!,
                        end_b: confirmedSearch?.selection?.end!
                    },
                    forToast:{
                        h_path: spl.join('.'),
                        h_filename:last!,
                        h_id: item.text.idHistorical,

                        b_path: confirmedSearch?.path!,
                        b_filename: confirmedSearch?.filename!,
                        line_start_b: findLineIdByWordId({wordId: confirmedSearch?.selection?.start!, text:biblicalText.index})!
                    }
                })
            }}
            className={`shrink-0 text-xs font-semibold px-3 py-1 rounded-md transition-colors
                ${isFree && !addNewHighlightMutation.isPending
                    ? "bg-orange-600 text-white hover:bg-orange-700 cursor-pointer"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }
            `}
        >
            Aggiungi
        </button>
    </>
)

export default DoubleCard
