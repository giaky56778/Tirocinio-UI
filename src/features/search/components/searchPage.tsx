import {useEffect, useState, Suspense} from 'react';
import SearchPageEditor from "@/features/search/components/search/searchPageEditor.tsx";
import SearchPageSkeleton from "@/features/search/components/skeleton/searchSkeleton.tsx";
import ErrorBoundary from "@/components/layout/errorBoundary.tsx";
import ForceUploadDialog from "@/features/upload-section/components/forceUploadDialog.tsx";
import {HighlightStoreProvider} from "@/features/editor/store/useHighlightStore.tsx";
import {useGlobalState} from "@/store/globalStateStore.tsx";
import {useReadSettingsSearch} from "@/features/search/hooks/useApiSearch.ts";
import {useHistoricalTextRead} from "@/features/search/hooks/useHistoricalTextRead.ts";

const SearchPage=()=>(
    <ErrorBoundary>
        <Suspense fallback={<SearchPageSkeleton/>}>
            <SearchPageContent/>
        </Suspense>
    </ErrorBoundary>
)

const EMPTY_ARRAY: never[] = []
const EMPTY_INDEX = {
    content: {},
    maxIndex: 0
}

function SearchPageContent() {

    const settings = useReadSettingsSearch()
    const textHistorical = useHistoricalTextRead('search')
    const globalState = useGlobalState()
    const rightSelectedText = textHistorical.selectedText
    const [hasLoadedOnce, setHasLoadedOnce] = useState(false)

    useEffect(() => {
        return ()=> {
            globalState.initPage.resetInitialMount('searchParams')
        }
    }, [])

    if (!textHistorical.historicalNamesQuery.isLoading && !textHistorical.selectedText) {
        return (
            <>
                <SearchPageSkeleton/>
                <ForceUploadDialog selectText={textHistorical.setSelectedText}/>
            </>
        )
    }

    const rightTextData = textHistorical.textQuery
    const isTextLoading = rightTextData.isLoading || rightTextData.isFetching

    if (!isTextLoading && !hasLoadedOnce)
        setHasLoadedOnce(true)

    if (!hasLoadedOnce && isTextLoading)
        return <SearchPageSkeleton/>

    //<SelectionStoreProvider key={rightSelectedText?.items.id ?? 'no-selected'}>
    return (
        <HighlightStoreProvider>
            <SearchPageEditor
                settings={ settings.settingsQuery.data!}
                tooltip={settings.tooltipQuery.data!}
                text={{
                    text: rightTextData.data?.text ?? EMPTY_ARRAY,
                    index: rightTextData.data?.index ?? EMPTY_INDEX,
                    chapter: rightTextData.data?.chapter ?? EMPTY_ARRAY,
                    listOfText: textHistorical.historicalNames ?? EMPTY_ARRAY
            }}
                opTextHistorical={{
                    select: textHistorical.setSelectedText,
                    delete: textHistorical.deleteText
            }}
                selectedText={rightSelectedText!}
                isLoading={isTextLoading}
            />
        </HighlightStoreProvider>
    )
}

export default SearchPage
