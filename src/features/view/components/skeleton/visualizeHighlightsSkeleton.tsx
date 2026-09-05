import {
    VISUALIZE_CONTAINER_CLASS,
    VISUALIZE_CONTENT_CLASS,
    VISUALIZE_HEADER_CLASS,
    VISUALIZE_LIST_CONTAINER_CLASS,
    VISUALIZE_PANEL_CLASS,
    VISUALIZE_PANEL_HEADER_CLASS,
    VISUALIZE_SIDEBAR_CLASS,
    VISUALIZE_TAB_ITEM_CLASS
} from "@/features/view/components/visualizeHighlights.tsx";
import {
    HIGHLIGHT_CARD_BODY_CLASS,
    HIGHLIGHT_CARD_CONTAINER_CLASS,
    HIGHLIGHT_CARD_FOOTER_CLASS,
    HIGHLIGHT_CARD_GRID_CLASS,
    HIGHLIGHT_CARD_HEADER_CLASS
} from "@/features/view/components/view/cardHighlight.tsx";

const VisualizeHighlightsSkeleton = () => (
    <div className={VISUALIZE_CONTAINER_CLASS}>
        {/* Header Skeleton */}
        <header className={VISUALIZE_HEADER_CLASS}>
            <div className="flex flex-col gap-1.5 animate-pulse">
                <div className="h-5 w-48 rounded bg-slate-200" />
                <div className="h-3 w-64 rounded bg-slate-100" />
            </div>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 animate-pulse">
                <div className="h-10 w-full rounded-lg bg-slate-200" />
            </div>
        </header>

        <div className={VISUALIZE_CONTENT_CLASS}>
            {/* Sidebar Tabs Skeleton */}
            <div className={VISUALIZE_SIDEBAR_CLASS}>
                {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className={`${VISUALIZE_TAB_ITEM_CLASS} animate-pulse bg-slate-50`}>
                        <div className="flex-1 space-y-1.5 pr-2">
                            <div className="h-3.5 w-3/4 rounded bg-slate-200" />
                            <div className="h-2.5 w-1/2 rounded bg-slate-100" />
                        </div>
                        <div className="h-5 w-6 rounded-full bg-slate-200" />
                    </div>
                ))}
            </div>

            {/* Panel Content Skeleton */}
            <div className={VISUALIZE_PANEL_CLASS}>
                {/* Top breadcrumb bar */}
                <div className={`${VISUALIZE_PANEL_HEADER_CLASS} animate-pulse`}>
                    <div className="h-3.5 w-44 rounded bg-slate-200" />
                    <div className="h-5 w-28 rounded-full bg-slate-100" />
                </div>

                {/* Cards List Skeleton */}
                <div className={`${VISUALIZE_LIST_CONTAINER_CLASS} overflow-y-auto space-y-4`}>
                    {Array.from({ length: 3 }).map((_, index) => (
                        <div
                            key={index}
                            className={`${HIGHLIGHT_CARD_CONTAINER_CLASS} animate-pulse`}
                        >
                            {/* Card Header */}
                            <div className={HIGHLIGHT_CARD_HEADER_CLASS}>
                                <div className="flex items-center gap-2.5">
                                    <div className="h-5.5 w-5.5 rounded-full bg-orange-200" />
                                    <div className="flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full bg-amber-200" />
                                        <div className="h-3.5 w-32 rounded bg-slate-300" />
                                    </div>
                                </div>
                                <div className="h-3 w-40 rounded bg-slate-200" />
                            </div>

                            {/* Card Body (2 Columns) */}
                            <div className={HIGHLIGHT_CARD_BODY_CLASS}>
                                <div className={HIGHLIGHT_CARD_GRID_CLASS}>
                                    {/* Column 1: Biblical */}
                                    <div className="space-y-2">
                                        <div className="h-3.5 w-14 rounded bg-emerald-100" />
                                        <div className="h-36 rounded-lg border border-slate-100 bg-slate-50 p-3 space-y-2">
                                            <div className="h-3 w-full rounded bg-slate-200" />
                                            <div className="h-3 w-5/6 rounded bg-slate-200" />
                                            <div className="h-3 w-4/6 rounded bg-slate-200" />
                                        </div>
                                    </div>
                                    {/* Column 2: Historical */}
                                    <div className="space-y-2">
                                        <div className="h-3.5 w-14 rounded bg-orange-100" />
                                        <div className="h-36 rounded-lg border border-slate-100 bg-slate-50 p-3 space-y-2">
                                            <div className="h-3 w-full rounded bg-slate-200" />
                                            <div className="h-3 w-5/6 rounded bg-slate-200" />
                                            <div className="h-3 w-4/6 rounded bg-slate-200" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Card Footer */}
                            <div className={HIGHLIGHT_CARD_FOOTER_CLASS}>
                                <div className="h-7 w-32 rounded-lg bg-orange-200" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
)

export default VisualizeHighlightsSkeleton
