import {SearchResultQueryType} from "@/features/search/hooks/useSearchResults.ts";

const LoadMore = ({hasSearch,searchResultQuery}: {
    hasSearch: boolean
    searchResultQuery: SearchResultQueryType
}) => (
    <>
        {searchResultQuery.hasNextPage && !searchResultQuery.isFetching && (
            <div className="flex justify-center py-3">
                <button
                    disabled={!hasSearch}
                    onClick={searchResultQuery.onLoadMore}
                    className={`${hasSearch ? "cursor-pointer bg-orange-700 text-white hover:bg-orange-800" : "bg-gray-100 text-gray-400 cursor-not-allowed"} text-xs font-bold px-4 py-1.5 rounded-md transition-colors duration-100`}
                >
                    Prossimi risultati
                </button>
            </div>
        )}
        {searchResultQuery.isFetching && (
            <div className="flex justify-center py-3 text-xs text-gray-400">Caricamento...</div>
        )}
    </>
)

export default LoadMore