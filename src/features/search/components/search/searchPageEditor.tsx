import {useMemo, useCallback} from 'react';
import {type TextSelectedType} from "@/hook/useTextNameSelection.ts";
import {useBatchedSearchParams} from "@/contexts/paramsProvider.tsx";
import {type EditorTextType} from "@/features/double-editor/editorPage.tsx";
import DoubleEditorSkeleton from "@/features/editor/components/skeleton/doubleEditorSkeleton.tsx";
import SearchResultsSection from "@/features/search/components/search/searchResultsSection.tsx";
import {type TextOperationType} from "@/features/double-editor/components/doubleEditor.tsx";
import SingleText from "@/features/search/components/search/singleText.tsx";
import {AlertDialog} from "@base-ui/react/alert-dialog";
import {type AlertModifyPayloadType} from "@/features/search/components/search/alertModifySearch.tsx";
import {useSelectionStore} from "@/features/editor/store/useSelectionStore.tsx";
import useInitSearch from "@/features/search/hooks/useInitSearch.ts";
import {useSearchParams} from "react-router";
import {type SettingsType, type TooltipType} from "@/features/search/api/searchApiType.ts";

type Props = {
    settings: SettingsType,
    tooltip: TooltipType,
    text: EditorTextType,
    selectedText: TextSelectedType,
    opTextHistorical: TextOperationType,
    isLoading: boolean
}

export default function SearchPageEditor({settings, tooltip, text, selectedText, opTextHistorical, isLoading}: Props) {

    const [searchParams] = useSearchParams()
    const searchElement = useSelectionStore(state => state.searchElement)
    const setSearchElement = useSelectionStore(state => state.setSearchElement)
    const setBatchedParams = useBatchedSearchParams()
    const searchHandle = AlertDialog.createHandle<AlertModifyPayloadType>()
    useInitSearch(selectedText, text.text)
    
    const resetSearchElement = useCallback(() => {
        setBatchedParams({ b: undefined, start: undefined, end: undefined }, '/search')
        setSearchElement(undefined)
    }, [setSearchElement, setBatchedParams])

    const searchHighlight = useMemo(() => (
        searchElement?.selection
            ? {
                ...searchElement.selection,
                colorId: '3'
            } : null
    ), [searchElement])

    const selected = useCallback((newSelected: TextSelectedType)=>{
        if(searchElement?.selection){
            searchHandle?.openWithPayload({
                onConfirm:()=>opTextHistorical.select(newSelected)
            })
            if(searchParams.has('start') && searchParams.has('end')){
                setBatchedParams({
                    start:undefined,
                    end:undefined,
                    q:searchElement.text
                })
            }
        }else{
            opTextHistorical.select(newSelected)
        }
    }, [opTextHistorical, searchElement, searchParams, setBatchedParams])

    return (
        <div className={"flex flex-row divide-x divide-gray-500 h-screen w-full"}>
            <SearchResultsSection
                isTextLoading={isLoading}
                settings={settings}
                tooltip={tooltip}
                searchElement={searchElement}
                resetSearchElement={resetSearchElement}
                historicalText={text}
                selectedText={selectedText}
                searchHandle={searchHandle}
            />
            {isLoading
                ?
                    <DoubleEditorSkeleton/>
                : (
                    <SingleText
                        text={text}
                        selectedText={selectedText}
                        searchHighlight={searchHighlight}
                        opTextHistorical={{
                            delete:opTextHistorical.delete,
                            select:selected
                        }}
                    />
                )
            }
        </div>
    )
}
