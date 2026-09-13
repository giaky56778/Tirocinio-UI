import {
    EDITOR_WINDOW_CONTAINER_CLASS,
    EDITOR_WINDOW_HEADER_CLASS
} from "@/features/editor/components/highlightEditorWindow.tsx";
import {CHAPTER_SELECT_CONTAINER_CLASS} from "@/features/editor/components/editor/indexTextPosition.tsx";

const ALL_WIDTHS = ['w-5/6', 'w-11/12', 'w-4/5', 'w-3/4', 'w-11/12', 'w-5/6', 'w-9/12', 'w-10/12', 'w-4/5', 'w-11/12', 'w-5/6', 'w-3/4', 'w-10/12', 'w-8/12', 'w-11/12']

export default function DoubleEditorSkeleton() {

    return(
        <div className={EDITOR_WINDOW_CONTAINER_CLASS}>
            <div className={EDITOR_WINDOW_HEADER_CLASS}>
                <div className="animate-pulse h-10 w-64 rounded-lg bg-orange-200"/>
            </div>

            <div className={CHAPTER_SELECT_CONTAINER_CLASS}>
                <div className="flex items-center justify-between rounded-lg border border-gray-300 bg-white px-3.5 py-2.5">
                    <div className="flex flex-col gap-1.5">
                        <div className="animate-pulse h-2 w-20 rounded bg-zinc-200"/>
                        <div className="animate-pulse h-3.5 w-28 rounded bg-zinc-200"/>
                    </div>
                    <div className="animate-pulse h-4 w-4 rounded bg-zinc-200"/>
                </div>
            </div>

            <div className="flex-1 overflow-hidden px-5 py-3">
                <div className="flex flex-col gap-3">
                    {Array.from({ length: ALL_WIDTHS.length }, (_, i) => (
                        <div key={i} className={`animate-pulse h-4 rounded bg-zinc-200 ${ALL_WIDTHS[i % ALL_WIDTHS.length]}`}/>
                    ))}
                </div>
            </div>
        </div>
    )
}
