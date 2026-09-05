import {Dialog} from "@base-ui/react/dialog";
import {ExpandIcon} from "@/components/ui/icons";
import DialogPortalPreview from "@/components/ui/common/dialogPortalPreview.tsx";
import DoubleResultViewReadOnly from "@/features/preview/doubleResultViewReadOnly.tsx";
import {LINE_EXTRACT_LOWER, LINE_EXTRACT_UPPER} from "@/utils/settings.ts";
import {SearchType} from "@/features/editor/reducer/selectionReducer.ts";
import {EditorTextType} from "@/features/double-editor/page/editorPage.tsx";
import {SingleSearchType} from "@/features/search/api/searchApiType.ts";
import {findLineIdByWordId} from "@/utils/commonUtil.ts";

import {AddNewHighlightObj} from "@/features/search/components/search/resultOutput.tsx";

type Props = {
    item: SingleSearchType,
    confirmedSearch?: SearchType,
    historicalText: EditorTextType,
    lineHistorical: number,
    isFree: boolean,
    addNewHighlight: AddNewHighlightObj
}

const DoubleSearchPreview = ({item, confirmedSearch, historicalText, lineHistorical, isFree, addNewHighlight}: Props) => (
    <>
        <Dialog.Root>
            <Dialog.Trigger
                className="cursor-pointer shrink-0 inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-800 transition-colors duration-100 select-none focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-orange-600">
                <ExpandIcon className="size-6"/>
                Anteprima
            </Dialog.Trigger>
            <DialogPortalPreview>
                <div inert className="min-h-0 overflow-hidden">
                    <DoubleResultViewReadOnly
                        bLine={lineHistorical}
                        bSearch={confirmedSearch!}
                        historicalText={{
                            ...historicalText,
                            text: historicalText.text.slice(Math.max(0, lineHistorical - LINE_EXTRACT_LOWER + 1), lineHistorical + LINE_EXTRACT_UPPER + 1),
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
            disabled={!isFree}
            onClick={() => {
                const spl = item.text.source.split('.')
                const last = spl.pop()
                addNewHighlight.add({
                    newHighlight: {
                        urn_h: item.text.source,
                        start_h: item.range?.startWordId!,
                        end_h: item.range?.endWordId!,
                        line_start_h: item.range?.startLine!,

                        b_id_text: confirmedSearch?.id!,
                        start_b: confirmedSearch?.selection?.start!,
                        end_b: confirmedSearch?.selection?.end!
                    },
                    forToast: {
                        h_path: spl.join('.'),
                        h_filename: last!,
                        h_id: item.text.idBiblical,

                        b_path: confirmedSearch?.path!,
                        b_filename: confirmedSearch?.filename!,
                        line_start_b: findLineIdByWordId({
                            wordId: confirmedSearch?.selection?.start!,
                            text: historicalText.index
                        })!
                    }
                })
            }}
            className={`shrink-0 text-xs font-semibold px-3 py-1 rounded-md transition-colors
                ${isFree
                    ? "bg-orange-700 text-white hover:bg-orange-800 font-bold cursor-pointer"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }
            `}
        >
            Aggiungi
        </button>
    </>
)

export default DoubleSearchPreview
