import {useEffect, useState} from "react";
import {useSearchParams} from "react-router";
import {useGlobalState} from "@/contexts/globalState.tsx";
import {useBatchedSearchParams} from "@/contexts/paramsProvider.tsx";
import {type TextSelectedType} from "@/hook/useTextNameSelection.ts";

export default function usePage(setSelected: (selected: TextSelectedType) => void) {
    const [searchParams] = useSearchParams()
    const globalState = useGlobalState()
    const setBatchedParams = useBatchedSearchParams()

    const [showPage, privateSetShowPage] = useState(() => {
        if(globalState.state.view?.page !== undefined)
            return globalState.state.view?.page
        const pageParam = searchParams.get('page')
        if (pageParam !== null) {
            const parsedPage = parseInt(pageParam)
            if (!isNaN(parsedPage)) {
                return parsedPage
            }
        }
        return 0
    })

    function setShowPage(page: number) {
        privateSetShowPage(page)
        globalState.setView({ page })
        setBatchedParams({page: String(page)}, '/viewHighlights')
    }

    useEffect(() => {
        if(globalState.state.view?.page !== undefined){
            setBatchedParams({page: String(globalState.state.view?.page)}, '/viewHighlights')
            return
        }
        if(!searchParams.has('page')){
            setBatchedParams({page: "0"}, '/viewHighlights')
            return
        }
    }, [])

    function select(newSelected: TextSelectedType) {
        setSelected(newSelected)
        setShowPage(0)
        setBatchedParams({page: "0"}, '/viewHighlights')
    }

    return {
        showPage,
        setShowPage,
        select
    }
}