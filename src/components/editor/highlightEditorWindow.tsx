import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {ScrollToIndexAlign, VList, VListHandle} from "virtua";
import {Dialog} from "@base-ui/react/dialog";
import {AlertDialog} from "@base-ui/react/alert-dialog";
import {ContextMenu} from "@base-ui/react/context-menu";
import {Popover} from "@base-ui/react/popover";
import useHighlightEditor from "@/hooks/useHighlightEditor.ts";
import {TextSelectedType} from "@/hooks/useTextNameSelection.ts";
import {ScrollType} from "@/hooks/useScrollDynamic.ts";
import {HighlightBound, HighlightLine} from "@/components/reducer/wordHighlightReducer.ts";
import HighlightRow from "@/components/editor/row/highlightRow.tsx";
import ToolBar from "@/components/editor/toolBar.tsx";
import ComboboxTextName from "@/components/editor/comboboxTextName.tsx";
import IndexTextPosition from "@/components/editor/indexTextPosition.tsx";
import UploadTextForm from "@/components/uploadTextForm.tsx";
import {UploadIcon} from "@/components/icons";
import ContextMenuCostume, {CostumeContextType, menuType} from "@/components/editor/contextMenuCostume.tsx";
import {Side} from "@/utils/globalType.ts";
import {TextIndexSchema, TextSchema, TextListSchema, ChapterIndexSchema} from "@/utils/JSONSchema.ts";
import {SearchHighlightType} from "@/components/search/searchPageEditor.tsx";
import useCustomSelection from "@/hooks/useCustomSelection.ts";
import {SyncHighlightsType} from "@/hooks/useSyncHighlights.ts";
import DialogCloseCostume from "@/components/common/dialogCloseCostume.tsx";
import useLineScroll from "@/hooks/useLineScroll.ts";
import {useLocation} from "react-router";


const EMPTY_HIGHLIGHT_LINES: HighlightLine[] = []
const EMPTY_HIGHLIGHT_BOUNDS: Record<string, HighlightBound> = {}

export type ModeType = 'readonly' | 'search' | 'editor' | 'doubleReadonly'

export const EDITOR_WINDOW_CONTAINER_CLASS = "h-full w-full flex flex-col flex-1 min-h-0 text-left relative min-w-0 min-h-0"
export const EDITOR_WINDOW_HEADER_CLASS = "relative flex shrink-0 items-center justify-center top-0 h-24 bg-blue-100 shadow-xs"

export type AlertHandlers = {
    deleteHandler: React.RefObject<AlertDialog.Handle<unknown>>
    setIdToDelete: React.Dispatch<React.SetStateAction<string | null>>
}

type BaseProps = {
    mode: ModeType
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
    side: Side,

    searchHighlight?: SearchHighlightType,
    chapterIndex?: ChapterIndexSchema,
    onTextChange?: (newSelected: TextSelectedType) => void,
    previewCardHandler?: React.RefObject<Popover.Handle<string>>,
    blockSelectedRef?: React.RefObject<boolean>,
    globalHighlight?: SyncHighlightsType,
    alert?: AlertHandlers,
    offset?: number
}

type Props = BaseProps & (
    {
        mode: 'readonly'
        globalHighlight: SyncHighlightsType
        offset: number
    } | {
        mode: 'search'
        searchHighlight: SearchHighlightType
    } | {
        mode: 'editor'
        onTextChange: (newSelected: TextSelectedType) => void
        globalHighlight: SyncHighlightsType
        previewCardHandler: React.RefObject<Popover.Handle<string>>
        blockSelectedRef: React.RefObject<boolean>
        alert: AlertHandlers
    } | {
        mode: 'doubleReadonly'
        globalHighlight: SyncHighlightsType
        offset: number
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
    biblicalBoundsRef: {current: {}},
    historicalBoundsRef: {current: {}},
    color: {},
    save: () => {},
    changeColor: () => {},
    lineSearch: () => null,
    deleteHighlight: () => {},
    modifySide: {
        sideToModify: null, setSideToModify: () => {}
    }
}

const DEFAULT_CHAPTER_INDEX: never[] = []

export default function HighlightEditorWindow({
    mode, text, selectedText, side, previewCardHandler, blockSelectedRef, alert,
    searchHighlight = null,
    chapterIndex = DEFAULT_CHAPTER_INDEX,
    onTextChange = () => {},
    scroll = DEFAULT_SCROLL,
    globalHighlight = DEFAULT_GLOBAL_HIGHLIGHT,
    offset
}: Props) {

    const location = useLocation()
    const {selectionOp, selectedRange, selectedRangePerLine} = useCustomSelection({
        side: side,
        text: text.text,
        index: text.index,
        selectedText: selectedText,
    })
    const {state, toolBar, highlightState, pointer} = useHighlightEditor({
        syncAction: globalHighlight,
        indexPerLine: text.index,
        side: side,
        selectText: {
            onUpdateSelection: (wordId) => selectionOp.update(side, wordId),
            onClearSelection: selectionOp.clear
        },
        blockSelectedRef
    })
    const onLineScroll = useLineScroll({
        page: mode,
        side: side
    })

    const [menuType, setMenuType] = useState<menuType>("default")
    const [highlightId, setHighlightId] = useState<string | null>(null)
    const refVList = useRef<VListHandle>(null)
    const [visibleRange, setVisibleRange] = useState({startIndex: 0, endIndex: 0})
    const latestOffset = useRef(0)
    const uploadDialog = useRef(Dialog.createHandle())

    const toggleMenuType = useCallback((type: menuType, id?: string) => {
        setMenuType(type)
        setHighlightId(id != null ? id : null)
    }, [])

    const contextMenu: CostumeContextType = useMemo(() => ({
        menuType,
        highlightId,
        toggleMenuType
    }), [menuType, highlightId, toggleMenuType])

    const findRange = useCallback((offset: number) => {
        if (!refVList.current)
            return

        latestOffset.current = offset
        const start = refVList.current.findItemIndex(latestOffset.current)
        const end = refVList.current.findItemIndex(latestOffset.current + refVList.current.viewportSize)

        setVisibleRange(prev =>
            prev.startIndex === start && prev.endIndex === end
                ? prev
                : {startIndex: start, endIndex: end}
        )

        onLineScroll?.(start)
    }, [onLineScroll])

    useEffect(() => {
        const targetIndex = scroll?.selfScroll.lineToScroll()
        if (targetIndex == null || !refVList.current)
            return

        refVList.current?.scrollToIndex(targetIndex.value, {align: targetIndex.mode, smooth: false})
    }, [scroll, side])

    return (
        <div onPointerDown={pointer.handlePointerDown}
             onPointerUp={pointer.onPointerUp}
             onPointerMove={pointer.handlePointerMove}
             className={EDITOR_WINDOW_CONTAINER_CLASS}
        >
            <header className={`${EDITOR_WINDOW_HEADER_CLASS} ${toolBar.toolBarVisibile ? 'border-l-slate-600' : ''}`}>
                <ComboboxTextName
                    side={side}
                    textNames={text.listOfText}
                    textNameSelect={selectedText}
                    onChange={onTextChange}
                    blockSelectedRef={pointer.isBlocked}
                />
                {side === "biblical" && ((location.pathname === '/search' && mode ==='search') || location.pathname === '/') && (
                    <Dialog.Trigger
                        handle={uploadDialog.current}
                        className="absolute bottom-2 right-4 inline-flex items-center gap-2 bg-white p-2 rounded-md text-sm font-medium shadow-sm hover:bg-gray-100 cursor-pointer"
                    >
                        <UploadIcon className="size-4"/>
                        Upload
                    </Dialog.Trigger>
                )}
            </header>
            <IndexTextPosition
                chapterIndex={chapterIndex}
                visibleRange={visibleRange}
                scroll={scroll?.selfScroll}
                blockSelectedRef={pointer.isBlocked}
            />
            <ContextMenu.Root
                onOpenChangeComplete={(isOpen) => {
                    pointer.isBlocked.current = isOpen
                    if (!isOpen)
                        toggleMenuType("default")
                }}
            >
                <ContextMenu.Trigger className="relative flex-1 min-h-0 block h-full w-full">
                    <div
                        data-editor-side={side}
                        className="relative flex-1 h-full min-h-0"
                        onContextMenuCapture={() => {
                            pointer.isBlocked.current = true
                            toggleMenuType("default")
                        }}
                    >
                        <VList
                            className={'select-none h-full w-full'}
                            data={text.text}
                            ref={refVList}
                            onScroll={findRange}
                            style={{
                                overflowY: `${mode === 'readonly' || mode === 'doubleReadonly' ? 'hidden' : 'auto'}`
                            }}
                        >
                            {(textItem, i) => {
                                const index = i + (offset ?? 0)
                                const lineHighlights = state.state.startEndPosition[index] ?? EMPTY_HIGHLIGHT_LINES
                                let lineHighlightBounds = EMPTY_HIGHLIGHT_BOUNDS

                                if (lineHighlights.length > 0) {
                                    const bounds: Record<string, HighlightBound> = {}
                                    let hasBound = false
                                    for (let i = 0; i < lineHighlights.length; i++) {
                                        const id = lineHighlights[i].highlightId
                                        if (id && state.state.highlightBounds[id]) {
                                            bounds[id] = state.state.highlightBounds[id]
                                            hasBound = true
                                        }
                                    }
                                    if (hasBound)
                                        lineHighlightBounds = bounds
                                }

                                return (
                                    <div
                                        className={"pl-[20px] pr-[20px]"}
                                        data-line-index={index}
                                    >
                                        <HighlightRow
                                            side={side}
                                            text={textItem}
                                            lineIndex={index}
                                            lineHighlights={lineHighlights}
                                            highlightState={highlightState}
                                            colors={state.color}
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
                        highlightBound={state.state.highlightBounds}
                        selectedRange={selectedRange}
                        contextMenu={contextMenu}
                        highlightState={highlightState}
                        alert={alert}
                        selectionOp={selectionOp}
                        side={side}
                    />
                </ContextMenu.Portal>
            </ContextMenu.Root>
            <ToolBar toolBar={toolBar}/>
            {side === "biblical" && (
                <Dialog.Root handle={uploadDialog.current}>
                    <Dialog.Portal>
                        <Dialog.Backdrop className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-200 data-ending-style:opacity-0"/>
                        <Dialog.Popup className="z-100 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-lg shadow-lg border border-gray-300 transition-opacity duration-200 data-ending-style:opacity-0">
                            <DialogCloseCostume/>
                            <UploadTextForm
                                onTextChange={onTextChange}
                                dialogHandle={uploadDialog}
                            />
                        </Dialog.Popup>
                    </Dialog.Portal>
                </Dialog.Root>
            )}
        </div>
    )
}
