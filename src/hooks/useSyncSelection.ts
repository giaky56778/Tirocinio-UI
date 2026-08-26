import {useEffect} from "react";
import {useLocation, useSearchParams} from "react-router";
import {TextSelectedType} from "@/hooks/useTextNameSelection.ts";
import {TextSchema} from "@/utils/JSONSchema.ts";
import {useGlobalState} from "@/contexts/globalState.tsx";
import {copyHighlightText} from "@/utils/util.ts";
import {useSelectionStore} from "@/store/useSelectionStore.ts";

export default function useInitSearchElement(
    textBiblicalSelected?: TextSelectedType,
    textBiblicalContent?: TextSchema
) {
    const [searchParams] = useSearchParams()
    const location = useLocation()
    const globalState = useGlobalState()
    
    const searchElement = useSelectionStore(state => state.searchElement)
    const setSearchElement = useSelectionStore(state => state.setSearchElement)

    useEffect(() => {
        if(location.pathname!=="/search" || !textBiblicalSelected) {
            setSearchElement(undefined)
            return
        }

        const targetSearch = globalState.state?.search?.searchElement ?? globalState.state?.search?.confirmedSearch
        const section = targetSearch?.selection
        if(targetSearch && section != undefined){
            const extractedText = (textBiblicalContent?.length ?? 0) > 0
                ? copyHighlightText({
                    text: textBiblicalContent!,
                    startWordId: section.start,
                    endWordId: section.end
                })
                : targetSearch.text

            setSearchElement({
                text: extractedText || targetSearch.text || "",
                path: targetSearch.path ?? textBiblicalSelected.path,
                filename: targetSearch.filename ?? textBiblicalSelected.items.filename,
                id: targetSearch.id ?? textBiblicalSelected.items.id,
                selection: {
                    start: section.start,
                    end: section.end,
                    side: "biblical"
                }
            })
            return
        }
        
        const paramStart = searchParams.get('start')
        const paramEnd = searchParams.get('end')

        if(paramStart && paramEnd) {
            const extractedText = (textBiblicalContent?.length ?? 0) > 0
                ? copyHighlightText({
                    text: textBiblicalContent!,
                    startWordId: Number(paramStart),
                    endWordId: Number(paramEnd)
                })
                : ""

            setSearchElement({
                text: extractedText,
                path: textBiblicalSelected.path,
                filename: textBiblicalSelected.items.filename,
                id: textBiblicalSelected.items.id,
                selection: {
                    start: Number(paramStart),
                    end: Number(paramEnd),
                    side: "biblical"
                }
            })
        }
    }, [])

    useEffect(() => {
        if (location.pathname === "/search") {
            globalState.searchRef.current.searchElement = searchElement
        }
    }, [searchElement, location.pathname, globalState.searchRef])
}
