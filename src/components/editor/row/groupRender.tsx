import React, {memo} from "react";
import {resolveColorClass, WordGroup} from "@/utils/util.ts";
import {HighlightBound} from "@/components/reducer/wordHighlightReducer.ts";
import {HighlightStateType} from "@/hooks/useHighlightEditor.ts";
import {CostumeContextType} from "@/components/editor/contextMenuCostume.tsx";
import {Popover} from "@base-ui/react/popover";
import {colorMap} from "@/utils/globalType.ts";
import {Side} from "@/components/editor/row/highlightRow.tsx";
import SingleWord from "@/components/editor/row/singleWord.tsx";
import ColoredGroup from "@/components/editor/row/coloredGroup.tsx";

const BOX_DECORATION_CLONE_STYLE = {
    boxDecorationBreak: 'clone',
    WebkitBoxDecorationBreak: 'clone'
} as const

const SELECTION_OVERLAY_STYLE = {
    ...BOX_DECORATION_CLONE_STYLE,
    backgroundColor: 'rgb(150, 150, 150)',
    opacity: 0.6
} as const

const SELECTED_STYLE = {
    ...BOX_DECORATION_CLONE_STYLE,
    backgroundColor: 'rgba(150, 150, 150, 0.35)',
    opacity: 0.6
} as const

type GroupRendererProps = {
    group: WordGroup,
    side: Side,
    lineIndex: number,
    highlightBounds: Record<string, HighlightBound>,
    highlightState: HighlightStateType,
    colors: Record<string, string>,
    contextMenu: CostumeContextType,
    previewCardHandler?: React.RefObject<Popover.Handle<string>>,
    onClearSelection:()=> void,
    toolBarVisible: boolean,
    blinkHighlightId: string | null
}

function GroupRenderer({group, side, lineIndex, highlightBounds, highlightState, colors, contextMenu, previewCardHandler, onClearSelection, toolBarVisible, blinkHighlightId}: GroupRendererProps) {

    const isColored = group.highlightId !== ''
    const isSelected = group.isSelected ?? false
    const isSearchHighlighted = !!group.searchColorId && !isColored
    const showHandles = highlightState.editMode && highlightState.highlightToModify === group.highlightId

    const colorClass = resolveColorClass(group, colors)

    const wordElements = group.words.map((w) => (
        <SingleWord
            key={w.ID}
            side={side}
            w={w}
            isFirstWord={highlightBounds[group.highlightId]?.startWord === w.ID}
            isLastWord={highlightBounds[group.highlightId]?.endWord === w.ID}
            showHandles={showHandles}
            highlightState={highlightState}
        />
    ))

    const contentWithSelection = isSelected
        ? <span style={SELECTION_OVERLAY_STYLE}>{wordElements}</span>
        : wordElements

    const keyPrefix = `${side}-group-${lineIndex}`
    const firstWordId = group.words[0]?.ID ?? 0

    if (isColored) {
        return (
            <ColoredGroup
                side={side}
                lineIndex={lineIndex}
                highlightId={group.highlightId}
                colorClass={`${colorClass} ${showHandles ? 'z-50' : ''}`}
                isBlinking={blinkHighlightId === group.highlightId}
                toolBarVisible={toolBarVisible}
                previewCardHandler={previewCardHandler}
                onContextMenu={() => contextMenu.toggleMenuType("highlight", group.highlightId)}
            >
                {contentWithSelection}
            </ColoredGroup>
        )
    }

    if (isSearchHighlighted) {
        return (
            <span
                key={`${keyPrefix}-search-${firstWordId}`}
                className={`${colorMap[group.searchColorId!]?.class ?? ''} inline`}
                style={BOX_DECORATION_CLONE_STYLE}
            >
                {contentWithSelection}
            </span>
        )
    }

    if (isSelected) {
        return (
            <span
                key={`${keyPrefix}-selection-${firstWordId}`}
                style={SELECTED_STYLE}
                onClick={(e: React.MouseEvent) => {
                    if (e.button === 0) {
                        e.preventDefault()
                        e.stopPropagation()
                        onClearSelection()
                    }
                }}
            >
                {wordElements}
            </span>
        )
    }

    return (
        <>
            <span key={`${keyPrefix}-plain-${firstWordId}`}>{wordElements}</span>
            <span className="line-spacer" aria-hidden="true"/>
        </>
    )
}

export default memo(GroupRenderer)
