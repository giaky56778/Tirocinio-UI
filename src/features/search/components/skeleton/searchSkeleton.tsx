import DoubleEditorSkeleton from "@/features/editor/components/skeleton/doubleEditorSkeleton.tsx";
import SearchResultsSectionSkeleton from "@/features/search/components/skeleton/searchResultsSectionSkeleton.tsx";

const SearchPageSkeleton = () => (
    <div className={`flex flex-row divide-x divide-gray-500 h-screen w-full`}>
        <SearchResultsSectionSkeleton/>
        <DoubleEditorSkeleton/>
    </div>
)

export default SearchPageSkeleton
