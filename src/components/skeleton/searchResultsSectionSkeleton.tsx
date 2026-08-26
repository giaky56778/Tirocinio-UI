import ResultsCardPreviewSkeleton from "@/components/skeleton/resultCardPreviewSkeleton.tsx";
import {
    SEARCH_RESULTS_CONTAINER_CLASS,
    SEARCH_SECTION_CONTAINER_CLASS,
    SEARCH_SECTION_FORM_CLASS,
    SEARCH_SECTION_HEADER_CLASS
} from "@/components/search/searchResultsSection.tsx";
import {
    SEARCH_RESULTS_HEADER_GRID_CLASS,
    SEARCH_RESULTS_SECTION_CLASS
} from "@/components/search/showResultSearch.tsx";

const ALL_WIDTHS = ['w-5/6', 'w-11/12', 'w-4/5', 'w-3/4', 'w-11/12', 'w-5/6', 'w-9/12', 'w-10/12', 'w-4/5', 'w-11/12']

export const SearchResultsSectionSkeleton = () => (
    <div className={SEARCH_SECTION_CONTAINER_CLASS}>
        <header className={SEARCH_SECTION_HEADER_CLASS}>
            <div className="animate-pulse h-6 w-36 rounded bg-orange-200"/>
        </header>
        <div className={SEARCH_SECTION_FORM_CLASS}>
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 mb-4 mt-4">
                    <div className="animate-pulse h-9 flex-1 rounded border border-zinc-200 bg-zinc-100"/>
                    <div className="animate-pulse h-8 w-32 shrink-0 rounded border border-zinc-200 bg-zinc-100"/>
                </div>
                <div className="flex items-center gap-2">
                    <div className="animate-pulse h-4 w-16 shrink-0 rounded bg-zinc-200"/>
                    <div className="animate-pulse h-16 flex-1 rounded border border-zinc-200 bg-zinc-100"/>
                </div>
                <div className="animate-pulse mt-7 h-9 w-1/2 mx-auto rounded bg-orange-200"/>
            </div>
        </div>
        <div className={SEARCH_RESULTS_CONTAINER_CLASS}>
            <div className={SEARCH_RESULTS_SECTION_CLASS}>
                <div className={`${SEARCH_RESULTS_HEADER_GRID_CLASS} gap-2`}>
                    <div className="animate-pulse h-4 w-14 rounded bg-zinc-200"/>
                    <div className="animate-pulse h-7 w-36 rounded-md bg-emerald-200"/>
                    <div className="animate-pulse h-7 w-24 justify-self-end rounded-md bg-zinc-100"/>
                </div>
                <ResultsCardPreviewSkeleton length={ALL_WIDTHS.length}/>
            </div>
        </div>
    </div>
)

export default SearchResultsSectionSkeleton
