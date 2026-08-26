import {Suspense, useRef} from "react";
import {HighlightStoreProvider} from "@/store/useHighlightStore.ts";
import {SelectionStoreProvider} from "@/store/useSelectionStore.ts";
import {SettingsType, TooltipType} from "@/api";
import {useBiblicalTextRead} from "@/hooks/useTextRead.ts";
import useScrollDynamic from "@/hooks/useScrollDynamic.ts";
import SearchPageEditor from "@/components/search/searchPageEditor.tsx";
import SearchPageSkeleton from "@/components/skeleton/searchSkeleton.tsx";
import ErrorBoundary from "@/components/errorBoundary.tsx";
import ForceUploadDialog from "@/components/forceUploadDialog.tsx";
import {useReadSettingsSearch} from "@/hooks/useOtherTextQuery.ts";

const SearchPage=()=>(
    <ErrorBoundary>
        <Suspense fallback={<SearchPageSkeleton/>}>
            <HighlightStoreProvider>
                <SelectionStoreProvider>
                    <SearchPageContent/>
                </SelectionStoreProvider>
            </HighlightStoreProvider>
        </Suspense>
    </ErrorBoundary>
)

function SearchPageContent() {
    
    const settings = useReadSettingsSearch()
    const textBiblical = useBiblicalTextRead('search')
    const scrollRight = useScrollDynamic()
    const hasInitialDataLoaded = useRef(false)
    const rightSelectedText = textBiblical.selectedText

    if (textBiblical.textQuery.data)
        hasInitialDataLoaded.current = true

    if (!hasInitialDataLoaded.current) {
        if (!textBiblical.biblicalNamesQuery.isLoading && !textBiblical.selectedText) {
            return (
                <>
                    <SearchPageSkeleton/>
                    <ForceUploadDialog selectText={textBiblical.setSelectedText} />
                </>
            )
        }
        return <SearchPageSkeleton/>
    }

    const rightTextData = textBiblical.textQuery;
    const isTextLoading = rightTextData.isLoading || rightTextData.isFetching;

    const textSafe = {
        text: rightTextData.data?.text ?? [],
        index: rightTextData.data?.index ?? { content: {}, maxIndex: 0 },
        chapter: rightTextData.data?.chapter ?? [],
        listOfText: textBiblical.biblicalNames ?? [],
    };

    const safeSettings: SettingsType = settings.settingsQuery.data!
    const safeTooltip: TooltipType = settings.tooltipQuery.data!

    return (
        <SearchPageEditor
            settings={safeSettings}
            tooltip={safeTooltip}
            text={textSafe}
            setSelectedTextBiblical={textBiblical.setSelectedText}
            selectedText={rightSelectedText!}
            scrollRight={scrollRight}
            isLoading={isTextLoading}
        />
    )
}

export default SearchPage
