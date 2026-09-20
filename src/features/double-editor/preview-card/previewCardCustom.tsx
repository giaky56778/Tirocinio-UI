import { useState, useMemo } from 'react';
import {Popover} from "@base-ui/react"
import {type ScrollType} from "@/features/editor/hooks/useScrollDynamic.ts";
import {type HighlightBound} from "@/features/editor/reducer/wordHighlightReducer.ts";
import {type TextSchema} from "@/api/indexType.ts";
import {showText} from "@/utils/commonUtil.ts";
import {ArrowSvg, XIcon} from "@/components/ui/icons";
import {OFFSET_SCROLL} from "@/utils/settings.ts";
import RenderPreviewCardText from "@/components/ui/common/renderPreviewCardText.tsx";
import {useHighlightStore} from "@/features/editor/store/useHighlightStore.tsx";
import {useSelectionStore} from "@/features/editor/store/useSelectionStore.tsx";
import {type EditorTextType} from "@/features/double-editor/editorPage.tsx";

type Props = {
    oppositeScrolls: {
        historical:ScrollType
        biblical:ScrollType
    },
    previewCardHandler: Popover.Handle<string>
    texts: {
        historical: EditorTextType,
        biblical: EditorTextType
    }
}

export default function PreviewCardCustom({previewCardHandler, oppositeScrolls, texts}: Props) {
    const setSelectionBlocked = useSelectionStore(s => s.setSelectionBlocked)

    const historical = useHighlightStore(state => state['historical']).highlightBounds
    const biblical = useHighlightStore(state => state['biblical']).highlightBounds
    const colors = useHighlightStore(state => state.colors)
    const highlightBounds ={
        historical,
        biblical
    }

    const [anchorPos, setAnchorPos] = useState<{ x: number; y: number }>({x: 0, y: 0})
    const anchorElement = useMemo(() => {
        return {
            getBoundingClientRect: () => DOMRect.fromRect({
                width: 0,
                height: 0,
                x: anchorPos.x,
                y: anchorPos.y,
            })
        }
    }, [anchorPos])

    return (
        <Popover.Root
            modal={false}
            handle={previewCardHandler}
            onOpenChange={(open, eventDetails) => {
                setSelectionBlocked(open)
                if (open) {
                    const nativeEvent = eventDetails.event as { clientX?: number; clientY?: number } | undefined
                    if (nativeEvent?.clientX != null && nativeEvent?.clientY != null) {
                        setAnchorPos({
                            x: nativeEvent.clientX,
                            y: nativeEvent.clientY,
                        })
                    }
                }
            }}
        >
            {({payload: payload}) => {
                const data = payload ?? ''
                const spl = data.split(':')
                const side = spl[0] === 'biblical' ? 'biblical' : 'historical'
                const highlightId = spl[1] ?? ''
                const oppositeSide = side === 'historical' ? 'biblical' : 'historical'

                const hBound = highlightId === '' ? null : highlightBounds[oppositeSide][highlightId]
                const hColor = highlightId === '' ? undefined : colors[highlightId]
                const oppositeScroll = side === 'historical' ? oppositeScrolls['biblical'] : oppositeScrolls['historical']
                const textOpposite:TextSchema = texts[oppositeSide].text
                const bounds = highlightBounds[oppositeSide]

                const lowerBound =highlightBounds[oppositeSide][highlightId]?.lineStart ?? 0
                const upperBound =highlightBounds[oppositeSide][highlightId]?.lineEnd ?? 0

                const textToShow = (id: string, b: Record<string, HighlightBound>) => showText({textLines:textOpposite.slice(lowerBound-1,upperBound+1), bound: b[id]}).result

                return (
                    <Popover.Portal>
                        <Popover.Positioner
                            className="z-100"
                            anchor={anchorElement ?? undefined}
                            side="bottom"
                            sideOffset={8}
                        >
                            <Popover.Popup className="origin-(--transform-origin) rounded-xl bg-white text-gray-900 shadow-xl shadow-gray-300/40 ring-1 ring-gray-200 transition-[transform,scale,opacity] data-ending-style:scale-95 data-ending-style:opacity-0 ">
                                <div className="flex w-md flex-col overflow-hidden rounded-xl">
                                    <div className="border-b border-gray-100 px-4 pb-2.5 pt-3.5 ">
                                        <span className="select-none text-xs font-medium text-gray-400 ">
                                            Riferimento a
                                        </span>
                                    </div>
                                    <RenderPreviewCardText
                                        text={textToShow(highlightId ?? '', bounds)}
                                        color={hColor}
                                    />
                                    <div className="px-4 pb-4">
                                        <button
                                            className="cursor-pointer flex w-full items-center justify-center rounded-lg bg-orange-700 hover:bg-orange-800 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
                                            onClick={() => {
                                                if (highlightId == null || hBound == null)
                                                    return
                                                oppositeScroll.setScroll({lineIndex: hBound.lineStart-OFFSET_SCROLL, highlightId, mode:'start'})
                                            }}
                                        >
                                            Vai al riferimento
                                        </button>
                                    </div>
                                </div>
                                <Popover.Arrow
                                    className="data-[side=bottom]:-top-2 data-[side=left]:-right-3.25 data-[side=right]:-left-3.25 data-[side=right]:-rotate-90 data-[side=top]:-bottom-2"
                                    render={ArrowSvg}
                                />
                                <Popover.Close
                                    className="absolute right-3 top-3 rounded p-1 hover:bg-slate-100 cursor-pointer"
                                    aria-label="Close"
                                >
                                    <XIcon className="size-4"/>
                                </Popover.Close>
                            </Popover.Popup>
                        </Popover.Positioner>
                    </Popover.Portal>
                )
            }}
        </Popover.Root>
    )
}
