const LoadMore = ({hasSearch,hasMore, isFetching, onLoadMore}: {
    hasSearch: boolean
    hasMore: boolean
    isFetching: boolean
    onLoadMore: () => void
}) => (
    <>
        {hasMore && !isFetching && (
            <div className="flex justify-center py-3">
                <button
                    disabled={!hasSearch}
                    onClick={onLoadMore}
                    className={`${hasSearch ? "bg-orange-600 text-white hover:bg-orange-700" : "bg-gray-100 text-gray-400 cursor-not-allowed"} text-xs font-semibold px-4 py-1.5 rounded-md transition-colors duration-100`}
                >
                    Prossimi risultati
                </button>
            </div>
        )}
        {isFetching && (
            <div className="flex justify-center py-3 text-xs text-gray-400">Caricamento...</div>
        )}
    </>
)

export default LoadMore