import EditorWindowSkeleton from "./editorWindowSkeleton.tsx";
import SearchResultsSkeleton from "./searchResultsSectionSkeleton.tsx";

const SearchPageSkeleton = () => (
    <div className={`flex flex-row h-screen w-full`}>
        <SearchResultsSkeleton/>
        <EditorWindowSkeleton/>
    </div>
)

export default SearchPageSkeleton
