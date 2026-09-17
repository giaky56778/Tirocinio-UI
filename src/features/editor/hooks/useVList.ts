import { useState, useEffect, useRef, useCallback} from 'react';
import {type TextType} from "@/utils/settings.ts";
import {type ModeType} from "@/features/editor/components/highlightEditorWindow.tsx";
import {type ScrollType} from "@/features/editor/hooks/useScrollDynamic.ts";
import useLineScroll from "@/features/editor/hooks/useLineScroll.ts";
import {type VListHandle} from "virtua";

type Props = {
    mode: ModeType
    side: TextType
    scroll?: { selfScroll: ScrollType }
}

export default function useVList({ mode, side, scroll }: Props) {
    const onLineScroll = useLineScroll({
        page: mode,
        side: side,
        scroll: scroll?.selfScroll
    })

    const ref = useRef<VListHandle>(null)
    const [visibleRange, setVisibleRange] = useState({startIndex: 0, endIndex: 0})
    const latestOffset = useRef(0)

    const findRange = useCallback((offset: number) => {
        if (!ref.current)
            return

        latestOffset.current = offset
        const start = ref.current.findItemIndex(latestOffset.current)
        const end = ref.current.findItemIndex(latestOffset.current + ref.current.viewportSize)

        setVisibleRange(prev =>
            prev.startIndex === start && prev.endIndex === end
                ? prev
                : {startIndex: start, endIndex: end}
        )

        onLineScroll?.(start)
    }, [onLineScroll])

    useEffect(() => {
        const targetIndex = scroll?.selfScroll.lineToScroll()
        if (targetIndex == null || !ref.current)
            return

        const target = targetIndex.value < 0 ? 0 : targetIndex.value
        ref.current?.scrollToIndex(target, {align: targetIndex.mode, smooth: false})
    }, [scroll, side])

    return {
        ref,
        visibleRange,
        findRange
    }
}
