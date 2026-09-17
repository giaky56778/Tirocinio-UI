import type {WordGroup} from "@/utils/commonUtil.ts";
import {useHighlightStore} from "@/features/editor/store/useHighlightStore.tsx";
import {colorMap} from "@/utils/settings.ts";

export function useResolveColorClass(group: WordGroup, colors: Record<string, string>): string {
    const isPreview = useHighlightStore(state => state.isPreview)
    const colorId = colors[group.highlightId]
    if (!colorId || !colorMap[colorId])
        return ''

    const colorClass = colorMap[colorId]
    return isPreview && group.highlightId!=='preview-highlight' ? colorClass.preview : colorClass.class
}