import {memo, RefObject, useMemo} from "react";
import {HighlightBound, HighlightLine} from "@/features/editor/reducer/wordHighlightReducer.ts";
import {Popover} from "@base-ui/react/popover";
import {HighlightStateType} from "@/features/editor/hooks/useEditorState.ts";
import {ChapterTitleItem, TextLineItem, TitleTextItem} from "@/api/indexType.ts";
import {WordGroup} from "@/utils/commonUtil.ts";
import {CostumeContextType} from "@/features/editor/components/editor/contextMenuCostume.tsx";
import GroupRenderer from "./groupRender";
import {SearchHighlight, SelectionRange} from "@/features/editor/reducer/selectionReducer.ts";
import {TEXT_FONT_CLASS, TextType} from "@/utils/settings.ts";
import {composeTitle, createGroup} from "@/features/editor/lib/utils.ts";

type Props = {
    side: TextType,
    text: TitleTextItem | ChapterTitleItem | TextLineItem,
    lineIndex: number,
    lineHighlights: HighlightLine[],
    highlightBounds: Record<string, HighlightBound>,
    highlightState: HighlightStateType,
    colors: Record<string, string>,
    contextMenu: CostumeContextType,
    blinkHighlightId: string | null,
    toolBarVisible: boolean,
    searchHighlight: SearchHighlight | null,
    lineSelection: HighlightLine | SelectionRange | null,
    onClearSelection:()=> void
    previewCardHandler?: RefObject<Popover.Handle<string>>,
}

function HighlightRow({side, text, lineIndex, lineHighlights, highlightBounds, highlightState, colors, contextMenu, previewCardHandler, blinkHighlightId, toolBarVisible, searchHighlight, lineSelection, onClearSelection}: Props) {

    if (text.type === "titleText")
        return (<h1 key={side + '-title-' + lineIndex}>{composeTitle(text.text)}</h1>)
    if (text.type === "chapterTitle")
        return (<h2 key={side + '-chapter-' + lineIndex}>{composeTitle(text.text)}</h2>)

    const safeSelectionRange = lineSelection
    const safeSearchHighlight = searchHighlight?.side === side ? searchHighlight : null

    const groups: WordGroup[] = useMemo(() => {
        return createGroup(text, lineHighlights, safeSelectionRange, safeSearchHighlight)
    }, [text, lineHighlights, safeSelectionRange, searchHighlight?.start, searchHighlight?.end, searchHighlight?.colorId, side])

    return (
        <div
            style={{
                paddingLeft: '5px',
                paddingRight: '20px',
            }}
            className="relative grid grid-cols-[0.5rem_minmax(0,1fr)] items-start gap-x-2"
        >
            <b className="col-start-1 text-[0.65rem] text-right text-gray-600 justify-self-end">
                {text.id.split('_')[2] === '1' ? `${text.id.split('_')[1]}` : ''}
            </b>
            <span className={`col-start-2 min-w-0 ${side === 'biblical' ? TEXT_FONT_CLASS : ''}`}>
                {groups.map((group, indexGroup) => (
                    <GroupRenderer
                        key={`${side}-group-renderer-${lineIndex}-${indexGroup}-${group.words[0]?.ID ?? 0}`}
                        group={group}
                        side={side}
                        lineIndex={lineIndex}
                        highlightBounds={highlightBounds}
                        highlightState={highlightState}
                        colors={colors}
                        contextMenu={contextMenu}
                        previewCardHandler={previewCardHandler}
                        onClearSelection={onClearSelection}
                        toolBarVisible={toolBarVisible}
                        blinkHighlightId={blinkHighlightId}
                    />
                ))}
            </span>
        </div>
    )
}


function equalMemo(prevProps: Props, nextProps: Props) {

    function areLineHighlightBoundsEqual(prevBounds: Record<string, HighlightBound>, nextBounds: Record<string, HighlightBound>): boolean {

        if (prevBounds === nextBounds)
            return true
        if (Object.keys(prevBounds).length !== Object.keys(nextBounds).length)
            return false

        let minWordId = Infinity
        let maxWordId = -Infinity
        if (prevProps.text.type === "text" && prevProps.text.text.length > 0) {
            const words = prevProps.text.text
            minWordId = words[0].ID
            maxWordId = words[words.length - 1].ID
        }

        for (const key of Object.keys(nextBounds)) {
            const prev = prevBounds[key]
            const next = nextBounds[key]
            
            if (prev === next)
                continue
            
            if (minWordId === Infinity)
                continue

            const startChanged = prev.startWord !== next.startWord;
            const endChanged = prev.endWord !== next.endWord;

            const isPrevStartInLine = prev.startWord >= minWordId && prev.startWord <= maxWordId
            const isNextStartInLine = next.startWord >= minWordId && next.startWord <= maxWordId
            const isPrevEndInLine = prev.endWord >= minWordId && prev.endWord <= maxWordId
            const isNextEndInLine = next.endWord >= minWordId && next.endWord <= maxWordId

            if (startChanged && (isPrevStartInLine || isNextStartInLine))
                return false
            if (endChanged && (isPrevEndInLine || isNextEndInLine))
                return false
        }
        return true
    }

    const isHighlightStateEqual =
        prevProps.highlightState.editMode === nextProps.highlightState.editMode &&
        prevProps.highlightState.highlightToModify === nextProps.highlightState.highlightToModify &&
        prevProps.highlightState.lastPressedHandle === nextProps.highlightState.lastPressedHandle

    const isContextMenuEqual =
        prevProps.contextMenu.menuType === nextProps.contextMenu.menuType &&
        prevProps.contextMenu.highlightId === nextProps.contextMenu.highlightId

    const isLineHighlightsEqual =
        prevProps.lineHighlights === nextProps.lineHighlights ||
        (prevProps.lineHighlights.length === 0 && nextProps.lineHighlights.length === 0)

    const isHighlightBoundsEqual = areLineHighlightBoundsEqual(prevProps.highlightBounds, nextProps.highlightBounds)

    return (
        prevProps.side === nextProps.side &&
        prevProps.text === nextProps.text &&
        prevProps.lineIndex === nextProps.lineIndex &&
        isLineHighlightsEqual &&
        isHighlightBoundsEqual &&
        isHighlightStateEqual &&
        prevProps.colors === nextProps.colors &&
        isContextMenuEqual &&
        prevProps.previewCardHandler === nextProps.previewCardHandler &&
        prevProps.blinkHighlightId === nextProps.blinkHighlightId &&
        prevProps.toolBarVisible === nextProps.toolBarVisible &&
        prevProps.lineSelection === nextProps.lineSelection &&
        prevProps.searchHighlight === nextProps.searchHighlight
    )
}

export default memo(HighlightRow, equalMemo)
