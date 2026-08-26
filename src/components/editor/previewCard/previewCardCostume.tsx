import {RefObject, useMemo, useState} from "react";
import {Popover} from "@base-ui/react"
import {ScrollType} from "@/hooks/useScrollDynamic.ts";
import {HighlightBound} from "@/components/reducer/wordHighlightReducer.ts";
import {TextSchema} from "@/utils/JSONSchema.ts";
import { showText} from "@/utils/util.ts";
import {ArrowSvg} from "@/components/icons";
import { OFFSET_SCROLL} from "@/utils/globalType.ts";
import RenderPreviewCardText from "@/components/editor/previewCard/renderPreviewCardText.tsx";
import {useHighlightStore} from "@/store/useHighlightStore.ts";

type PreviewCardCostumeProps = {
    oppositeScrolls: {
        biblical:ScrollType
        historical:ScrollType
    },
    previewCardHandler: RefObject<Popover.Handle<string>>
    blockSelectedRef: RefObject<boolean>
    texts: {
        biblical:{
            text: any
            index: any
        },
        historical:{
            text: any
            index: any
        }
    }
}

export default function PreviewCardCostume({previewCardHandler, oppositeScrolls, blockSelectedRef, texts}: PreviewCardCostumeProps) {

    const biblical = useHighlightStore(state => state['biblical']).highlightBounds
    const historical = useHighlightStore(state => state['historical']).highlightBounds
    const colors = useHighlightStore(state => state.colors)
    const highlightBounds ={
        biblical,
        historical
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
            modal={true}
            handle={previewCardHandler.current}
            onOpenChange={(open, eventDetails) => {
                blockSelectedRef.current = open
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
                const side = spl[0] === 'historical' ? 'historical' : 'biblical'
                const highlightId = spl[1] ?? ''
                const oppositeSide = side === 'biblical' ? 'historical' : 'biblical'

                const hBound = highlightId === '' ? null : highlightBounds[oppositeSide][highlightId]
                const hColor = highlightId === '' ? undefined : colors[highlightId]
                const oppositeScroll = side === 'biblical' ? oppositeScrolls['historical'] : oppositeScrolls['biblical']
                const textOpposite:TextSchema = texts[oppositeSide].text
                const bounds = highlightBounds[oppositeSide]

                const lowerBound =highlightBounds[oppositeSide][highlightId]?.lineStart ?? 0
                const upperBound =highlightBounds[oppositeSide][highlightId]?.lineEnd ?? 0

                const textToShow = (id: string, b: Record<string, HighlightBound>) => showText({textLines:textOpposite.slice(lowerBound-1,upperBound+1), bound: b[id]})

                return (
                    <Popover.Portal>
                        <Popover.Positioner
                            className="z-100"
                            anchor={anchorElement ?? undefined}
                            side="bottom"
                            sideOffset={8}
                        >
                            <Popover.Popup className="origin-(--transform-origin) rounded-xl bg-white text-gray-900 shadow-xl shadow-gray-300/40 ring-1 ring-gray-200 transition-[transform,scale,opacity] data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0 ">
                                <div className="flex w-md flex-col overflow-hidden rounded-xl">
                                    <div className="border-b border-gray-100 px-4 pb-2.5 pt-3.5 ">
                                        <span className="select-none text-xs font-medium text-gray-400 ">Reference to</span>
                                    </div>
                                    <RenderPreviewCardText
                                        text={textToShow(highlightId ?? '', bounds)}
                                        color={hColor}
                                    />
                                    <div className="px-4 pb-4">
                                        <button
                                            className="flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-indigo-700 active:bg-indigo-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                            onClick={() => {
                                                if (highlightId == null || hBound == null)
                                                    return
                                                oppositeScroll.setScroll({lineIndex: hBound.lineStart-OFFSET_SCROLL, highlightId, mode:'start'})
                                            }}
                                        >
                                            View in text
                                        </button>
                                    </div>
                                </div>
                                <Popover.Arrow
                                    className="data-[side=bottom]:-top-2 data-[side=left]:-right-3.25 data-[side=left]:rotate-90 data-[side=right]:-left-3.25 data-[side=right]:-rotate-90 data-[side=top]:-bottom-2 data-[side=top]:rotate-180"
                                    render={ArrowSvg}/>
                            </Popover.Popup>
                        </Popover.Positioner>
                    </Popover.Portal>
                )
            }}
        </Popover.Root>
    )
}
