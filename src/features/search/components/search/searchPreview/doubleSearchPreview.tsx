import {Dialog} from "@base-ui/react/dialog";
import {ExpandIcon} from "@/components/ui/icons";
import DialogPortalPreview from "@/components/ui/common/dialogPortalPreview.tsx";
import DoubleResultViewReadOnly from "@/features/search/components/preview/doubleResultViewReadOnly.tsx";
import {LINE_EXTRACT_LOWER, LINE_EXTRACT_UPPER} from "@/utils/settings.ts";
import type {SearchType} from "@/features/editor/reducer/selectionReducer.ts";
import type {EditorTextType} from "@/features/double-editor/editorPage.tsx";
import type {SingleSearchType} from "@/features/search/api/searchApiType.ts";
import {findLineIdByWordId} from "@/utils/commonUtil.ts";
import type {AddNewHighlightQueryType} from "@/features/search/hooks/useApiSearch.ts";

type Props = {
    item: SingleSearchType,
    confirmedSearch?: SearchType,
    historicalText: EditorTextType,
    lineHistorical: number,
    isFree: boolean,
    addNewHighlight: AddNewHighlightQueryType
}

export default function DoubleSearchPreview({item, confirmedSearch, historicalText, lineHistorical, isFree, addNewHighlight}: Props){
    const range = item.range
    const selection = confirmedSearch?.selection

    if (!confirmedSearch || !selection || !range)
        return <></>

    return (
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
                            bSearch={confirmedSearch}
                            historicalText={{
                                ...historicalText,
                                text: historicalText.text.slice(Math.max(0, lineHistorical - LINE_EXTRACT_LOWER + 1), lineHistorical + LINE_EXTRACT_UPPER + 1),
                            }}
                            h={`${item.text.source}:${range.startLine}`}
                            b_range={{
                                startWord: selection.start,
                                endWord: selection.end
                            }}
                            h_range={{
                                startWord: range.startWordId,
                                endWord: range.endWordId
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
                            urn_b: item.text.source,
                            start_b: range.startWordId,
                            end_b: range.endWordId,
                            line_start_b: range.startLine,

                            h_id_text: confirmedSearch.id,
                            start_h: selection.start,
                            end_h: selection.end
                        },
                        forToast: {
                            b_path: spl.join('.'),
                            b_filename: last ?? '',
                            b_id: item.text.idBiblical,

                            h_path: confirmedSearch.path,
                            h_filename: confirmedSearch.filename,
                            line_start_h: findLineIdByWordId({
                                wordId: selection.start,
                                text: historicalText.index
                            }) ?? 0
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
}
