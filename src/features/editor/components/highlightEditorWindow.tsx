import {RefObject, useMemo, useRef} from "react";
import {useLocation} from "react-router";
import {ScrollToIndexAlign, VList} from "virtua";
import {Dialog} from "@base-ui/react/dialog";
import {AlertDialog} from "@base-ui/react/alert-dialog";
import {Popover} from "@base-ui/react/popover";
import {ContextMenu} from "@base-ui/react/context-menu";
import {useEditorState} from "@/features/editor/hooks/useEditorState.ts";
import useEditorUI from "@/features/editor/hooks/useEditorUI.ts";
import useCustomSelection from "@/features/editor/hooks/useCustomSelection.ts";
import usePointer from "@/features/editor/hooks/usePointer.ts";
import {TextSelectedType} from "@/hook/useTextNameSelection.ts";
import {ScrollType} from "@/features/editor/hooks/useScrollDynamic.ts";
import {HighlightBound, HighlightLine} from "@/features/editor/reducer/wordHighlightReducer.ts";
import HighlightRow from "@/features/editor/components/editor/row/highlightRow.tsx";
import ToolBar from "@/features/editor/components/editor/toolBar.tsx";
import ComboboxTextName from "@/features/editor/components/editor/comboboxTextName.tsx";
import IndexTextPosition from "@/features/editor/components/editor/indexTextPosition.tsx";
import UploadTextForm from "@/features/upload-section/components/uploadTextForm.tsx";
import {UploadIcon} from "@/components/ui/icons";
import ContextMenuCostume from "@/features/editor/components/editor/contextMenuCostume.tsx";
import {TextType} from "@/utils/settings.ts";
import {ChapterIndexSchema, TextIndexSchema, TextListSchema, TextSchema} from "@/api/indexType.ts";
import {SyncHighlightsType} from "@/features/double-editor/hook/useSyncHighlights.ts";
import DialogCloseCostume from "@/components/ui/common/dialogCloseCostume.tsx";
import {TextOperationType} from "@/features/double-editor/components/doubleEditor.tsx";
import {AlertModifyPayloadType} from "@/features/search/components/search/alertModifySearch.tsx";
import useVList from "@/features/editor/hooks/useVList.ts";
import useEditorContextMenu from "@/features/editor/hooks/useEditorContextMenu.ts";

export type ModeType = 'readonly' | 'search' | 'editor' | 'doubleReadonly'

export const EDITOR_WINDOW_CONTAINER_CLASS = "h-full w-full flex flex-col flex-1 min-h-0 text-left relative min-w-0 min-h-0"
export const EDITOR_WINDOW_HEADER_CLASS = "relative flex shrink-0 items-center justify-center top-0 h-24 bg-orange-100"

export type SearchHighlightType = {
    colorId: string
    start: number
    end: number
    side: TextType
} | null

type BaseProps = {
    mode: ModeType,
    side: TextType,
    text: {
        text: TextSchema
        index: TextIndexSchema
        listOfText: TextListSchema
    },
    selectedText: TextSelectedType,
    scroll?: {
        selfScroll: ScrollType
        otherScroll?: ScrollType
    },

    searchHighlight?: SearchHighlightType,
    chapterIndex?: ChapterIndexSchema,
    textOp?: TextOperationType,
    previewCardHandler?: RefObject<Popover.Handle<string>>,
    blockSelectedRef?: RefObject<boolean>,
    globalHighlight?: SyncHighlightsType,
    offset?: number,
    alertDeleteHandler?: RefObject<AlertDialog.Handle<AlertModifyPayloadType>>
}

type Props = BaseProps & (
    {
        mode: 'readonly'
        globalHighlight: SyncHighlightsType
        offset: number
    } | {
        mode: 'doubleReadonly'
        globalHighlight: SyncHighlightsType
        offset: number
    } | {
        mode: 'search'
        searchHighlight: SearchHighlightType
        textOp: TextOperationType
    } | {
        mode: 'editor'
        textOp: TextOperationType
        globalHighlight: SyncHighlightsType
        previewCardHandler: RefObject<Popover.Handle<string>>
        blockSelectedRef: RefObject<boolean>
        alertDeleteHandler: RefObject<AlertDialog.Handle<AlertModifyPayloadType>>
    }
)

const DEFAULT_SCROLL = {
    selfScroll: {
        blinkHighlightId: null,
        isNavigating: false,
        mode: 'start' as ScrollToIndexAlign,
        setScroll: () => {},
        lineToScroll: () => null,
        onMoved: () => {}
    }
}
const DEFAULT_GLOBAL_HIGHLIGHT = {
    initialHighlights: {},
    historicalBoundsRef: {current: {}},
    biblicalBoundsRef: {current: {}},
    color: {},
    save: () => {},
    changeColor: () => {},
    lineSearch: () => null,
    deleteHighlight: () => {},
    modifySide: {
        sideToModify: null,
        setSideToModify: () => {}
    }
}
const DEFAULT_CHAPTER_INDEX: never[] = []
const DEFAULT_TEXT_OP: TextOperationType = {
    select: () => {},
    delete: () => {}
}
const EMPTY_HIGHLIGHT_LINES: HighlightLine[] = []
const EMPTY_HIGHLIGHT_BOUNDS: Record<string, HighlightBound> = {}

export default function HighlightEditorWindow({
                                                  mode,
                                                  text,
                                                  selectedText,
                                                  side,
                                                  previewCardHandler,
                                                  blockSelectedRef,
                                                  searchHighlight = null,
                                                  chapterIndex = DEFAULT_CHAPTER_INDEX,
                                                  textOp = DEFAULT_TEXT_OP,
                                                  scroll = DEFAULT_SCROLL,
                                                  globalHighlight = DEFAULT_GLOBAL_HIGHLIGHT,
                                                  offset,
                                                  alertDeleteHandler,
                                              }: Props) {

    const location = useLocation()
    const uploadDialog = useRef(Dialog.createHandle())

    const vList = useVList({ mode, side, scroll })
    const contextMenu = useEditorContextMenu()

    const {
        stateInteractive,
        toolBar,
        isVisible,
        highlightToModify,
        setColorHighlight,
        showToolBarCaller,
        updateHighlightBound
    } = useEditorState({side, globalHighlight})

    const {selectHandle, deselectHandle, whichIsPressed, lastPressedHandle} = useEditorUI()
    const {selectionOp, selectedRange, selectedRangePerLine} = useCustomSelection({
        side: side,
        text: text.text,
        index: text.index,
        selectedText: selectedText,
    })

    const pointer = usePointer({
        onPointerDown: selectionOp.clear,
        onPointerUp: deselectHandle,
        selectionUpdate: (wordId) => selectionOp.update(side, wordId),
        updateHighlight: (wordId) => {
            const press = whichIsPressed()
            if (press != null && wordId.spanID != null)
                updateHighlightBound(wordId.spanID, press, text.index)
        },
        blockSelectedRef
    })

    const highlightState = useMemo(() => ({
        editMode: isVisible,
        selectHandle,
        highlightToModify,
        setColorHighlight,
        showToolBar: showToolBarCaller,
        lastPressedHandle,
    }), [isVisible, selectHandle, highlightToModify, setColorHighlight, showToolBarCaller, lastPressedHandle])

    return (
        <div
            onPointerDown={pointer.handlePointerDown}
            onPointerUp={pointer.onPointerUp}
            onPointerMove={pointer.handlePointerMove}
            className={EDITOR_WINDOW_CONTAINER_CLASS}
        >
            <header className={`${EDITOR_WINDOW_HEADER_CLASS} ${toolBar.toolBarVisibile ? 'border-l-slate-600' : ''}`}>
                <ComboboxTextName
                    side={side}
                    textNames={text.listOfText}
                    textNameSelect={selectedText}
                    textOp={textOp}
                    blockSelectedRef={pointer.isBlocked}
                />
                {side === "historical" && ((location.pathname === '/search' && mode === 'search') || location.pathname === '/') && (
                    <Dialog.Trigger
                        handle={uploadDialog.current}
                        className="border border-gray-200 absolute bottom-2 right-4 inline-flex items-center gap-2 bg-white p-2 rounded-md text-sm font-medium  hover:bg-gray-100 cursor-pointer"
                    >
                        <UploadIcon className="size-4"/>
                        Upload
                    </Dialog.Trigger>
                )}
            </header>
            <IndexTextPosition
                chapterIndex={chapterIndex}
                visibleRange={vList.visibleRange}
                scroll={scroll?.selfScroll}
                blockSelectedRef={pointer.isBlocked}
            />
            <ContextMenu.Root
                onOpenChangeComplete={(isOpen) => {
                    pointer.isBlocked.current = isOpen
                    if (!isOpen)
                        contextMenu.toggleMenuType("default")
                }}
            >
                <ContextMenu.Trigger className="relative flex-1 min-h-0 block h-full w-full">
                    <div
                        data-editor-side={side}
                        className="relative flex-1 h-full min-h-0"
                        onContextMenuCapture={() => {
                            pointer.isBlocked.current = true
                            contextMenu.toggleMenuType("default")
                        }}
                    >
                        <VList
                            className={'select-none h-full w-full'}
                            data={text.text}
                            ref={vList.ref}
                            onScroll={vList.findRange}
                            style={{
                                overflowY: `${mode === 'readonly' || mode === 'doubleReadonly' ? 'hidden' : 'auto'}`
                            }}
                        >
                            {(textItem, i) => {
                                const index = i + (offset ?? 0)
                                const lineHighlights = stateInteractive.state.startEndPosition[index] ?? EMPTY_HIGHLIGHT_LINES
                                let lineHighlightBounds = EMPTY_HIGHLIGHT_BOUNDS

                                if (lineHighlights.length > 0) {
                                    const bounds: Record<string, HighlightBound> = {}
                                    let hasBound = false
                                    for (let j = 0; j < lineHighlights.length; j++) {
                                        const id = lineHighlights[j].highlightId
                                        if (id && stateInteractive.state.highlightBounds[id]) {
                                            bounds[id] = stateInteractive.state.highlightBounds[id]
                                            hasBound = true
                                        }
                                    }
                                    if (hasBound)
                                        lineHighlightBounds = bounds
                                }

                                return (
                                    <div
                                        className={`pl-5 pr-5 ${i === text.text.length - 1 ? 'pb-12' : ''}`}
                                        data-line-index={index}
                                    >
                                        <HighlightRow
                                            side={side}
                                            text={textItem}
                                            lineIndex={index}
                                            lineHighlights={lineHighlights}
                                            highlightState={highlightState}
                                            colors={stateInteractive.color}
                                            contextMenu={contextMenu}
                                            previewCardHandler={previewCardHandler}
                                            highlightBounds={lineHighlightBounds}
                                            blinkHighlightId={scroll?.selfScroll.blinkHighlightId}
                                            toolBarVisible={toolBar.toolBarVisibile}
                                            searchHighlight={searchHighlight}
                                            lineSelection={selectedRangePerLine?.[side]?.[index] ?? null}
                                            onClearSelection={selectionOp.clear}
                                        />
                                    </div>
                                )
                            }}
                        </VList>
                    </div>
                </ContextMenu.Trigger>
                <ContextMenu.Portal className={'z-100'} onContextMenu={(e) => e.preventDefault()}>
                    <ContextMenuCostume
                        textType={side}
                        highlightBound={stateInteractive.state.highlightBounds}
                        selectedRange={selectedRange}
                        contextMenu={contextMenu}
                        highlightState={highlightState}
                        alertDeleteHandler={alertDeleteHandler}
                        deleteHighlight={globalHighlight.deleteHighlight}
                        selectionOp={selectionOp}
                        side={side}
                    />
                </ContextMenu.Portal>
            </ContextMenu.Root>
            <ToolBar toolBar={toolBar}/>
            {side === "historical" && (
                <Dialog.Root handle={uploadDialog.current}>
                    <Dialog.Portal>
                        <Dialog.Backdrop
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-200 data-ending-style:opacity-0"/>
                        <Dialog.Popup
                            className="z-100 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-lg border border-gray-300 transition-opacity duration-200 data-ending-style:opacity-0">
                            <DialogCloseCostume/>
                            <UploadTextForm
                                onTextChange={textOp.select}
                                dialogHandle={uploadDialog}
                            />
                        </Dialog.Popup>
                    </Dialog.Portal>
                </Dialog.Root>
            )}
        </div>
    )
}
