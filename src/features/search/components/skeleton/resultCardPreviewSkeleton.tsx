import {
    RESULT_CARD_BODY_CLASS,
    RESULT_CARD_CONTAINER_CLASS,
    RESULT_CARD_FOOTER_CLASS,
    RESULT_CARD_HEADER_CLASS
} from "@/features/search/components/search/resultOutput.tsx";

const ResultsCardPreviewSkeleton = ({ length }: { length: number }) => (
    <div className="flex-1 overflow-hidden">
        <div className="flex flex-col gap-2.5">
            {Array.from({ length }, (_, i) => (
                <div key={i} className={`${RESULT_CARD_CONTAINER_CLASS} border-gray-200 overflow-hidden`}>
                    <div className={RESULT_CARD_HEADER_CLASS}>
                        <div className="flex items-center gap-2 min-w-0">
                            <div className="animate-pulse size-5 shrink-0 rounded-full bg-orange-200"/>
                            <div className="animate-pulse h-2.5 w-20 rounded bg-zinc-200"/>
                        </div>
                    </div>
                    <div className={`${RESULT_CARD_BODY_CLASS} flex flex-col gap-1.5`}>
                        <div className="animate-pulse h-3 rounded bg-zinc-200"/>
                        <div className="animate-pulse h-3 w-2/3 rounded bg-zinc-200"/>
                        <div className="animate-pulse h-2.5 w-1/3 rounded bg-zinc-100 mt-1"/>
                    </div>
                    <div className={RESULT_CARD_FOOTER_CLASS}>
                        <div className="flex gap-1">
                            <div className="animate-pulse h-4 w-10 rounded-full bg-zinc-100"/>
                            <div className="animate-pulse h-4 w-14 rounded-full bg-zinc-100"/>
                        </div>
                        <div className="animate-pulse h-6 w-16 rounded-md bg-zinc-200"/>
                    </div>
                </div>
            ))}
        </div>
    </div>
)

export default ResultsCardPreviewSkeleton