import {useCallback, useEffect, useState} from "react";
import {useSearchParams} from "react-router";
import toast from "react-hot-toast";
import {type PageType, useGlobalState} from "@/store/globalStateStore.tsx";
import {useBatchedSearchParams} from "@/contexts/paramsProvider.tsx";
import {type TextType} from "@/utils/settings.ts";
import {type ContentItemText, type TextListSchema} from "@/api/indexType.ts";
import {useDeleteHistoricalText} from "@/hook/useDeleteText.ts";
import {type UrlPath} from "@/features/editor/lib/utils.ts";
import {useSelectionStore} from "@/features/editor/store/useSelectionStore.tsx";

export type TextSelectedType = {
    path: string
    items: ContentItemText
}

type Props = {
    names: TextListSchema
    initUrl?: UrlPath
    side: TextType
    page: PageType
}

function urlToPath(url: string | null, line: string | null | undefined): UrlPath | undefined {
    if (!url)
        return
    const spl=url.split(':')
    if (spl.length === 0)
        return
    return {
        path: spl[0],
        filename: spl[1],
        scrollLine: spl[2]
            ? Number(spl[2])
            : line
                ? Number(line)
                : 0
    }
}

export function resolveDefaultSelection(
    names: TextListSchema,
    globalSelectedText?: TextSelectedType,
    initUrl?: UrlPath
): TextSelectedType | undefined {
    if (initUrl) {
        let foundGroup = names.find(g => g.path === initUrl.path)
        let item = foundGroup?.items.find(i => i.filename === initUrl.filename)

        if (!item) {
            for (const group of names) {
                const found = group.items.find(i => i.filename === initUrl.filename)
                if (found) {
                    foundGroup = group
                    item = found
                    break
                }
            }
        }

        if (item && foundGroup) {
            return {
                path: foundGroup.path,
                items: item
            }
        }
    }

    if (globalSelectedText != undefined) {
        const exists = names.some(g => g.path === globalSelectedText.path && g.items.some(i => i.id === globalSelectedText.items.id))
        if (exists)
            return globalSelectedText
    }

    const firstGroup = names[0]
    const firstItem = firstGroup?.items[0]
    if (!firstItem || !firstGroup)
        return undefined

    return {
        path: firstGroup.path,
        items: firstItem
    }
}

export default function useTextNameSelection({names, initUrl, side, page}: Props) {
    const paramKey = side === 'historical' ? 'h':'b'
    const origin = page === 'editor' ? '/' : page === 'search' ? '/search' : '/viewHighlights'

    const [searchParams] = useSearchParams()
    const useDelete=useDeleteHistoricalText()
    const globalState = useGlobalState()
    const setBatchedParams = useBatchedSearchParams()
    const setSearchElement = useSelectionStore(state => state.setSearchElement)

    const [selected, setSelectedState] = useState<TextSelectedType | undefined>(() => {
        if (names.length === 0)
            return undefined

        const urlString = searchParams.get(paramKey)

        const parsedUrlFromParams = urlToPath(urlString,undefined)
        const globalSelected = globalState.getSelectedText(page, side)

        if (parsedUrlFromParams) {
            const resolved = resolveDefaultSelection(names, globalSelected?.text, parsedUrlFromParams)
            if (resolved) return resolved
        }

        if (initUrl) {
            const resolved = resolveDefaultSelection(names, globalSelected?.text, initUrl)
            if (resolved) return resolved
        }

        return resolveDefaultSelection(names, globalSelected?.text)
    })

    const setSelected = useCallback((newSelected: TextSelectedType|undefined) => {
        if(newSelected == undefined) {
            setSelectedState(undefined)
            return
        }

        setSearchElement(undefined) //cancella la selezione confermata per la sezione search
        setSelectedState(newSelected)
        globalState.setSelectedText(page, side, newSelected)

        const newParams: Record<string, string> = {
            [paramKey]: `${newSelected.path}:${newSelected.items.filename}`
        }

        setBatchedParams(newParams, origin)
    }, [setSearchElement, globalState, page, side, paramKey, setBatchedParams, origin])

    const deleteText = useCallback((id: number) => {
        if (selected?.items.id === id) {
            let firstRemainingItem: TextSelectedType | undefined
            for (const group of names) {
                const item = group.items.find(i => i.id !== id)
                if (item) {
                    firstRemainingItem = {
                        path: group.path,
                        items: item
                    }
                    break
                }
            }
            setSelected(firstRemainingItem)
        }
        useDelete.mutate({id})

    }, [selected?.items.id, useDelete, setSelected, names])

    useEffect(() => {
        const urlString = searchParams.get(paramKey)
        const parsedUrlFromParams = urlToPath(urlString, undefined)

        if (!parsedUrlFromParams){
            if (selected && !urlString && names.length > 0) {
                if (!searchParams.has(paramKey)) {
                    setBatchedParams({
                        [paramKey]: `${selected.path}:${selected.items.filename}`
                    }, origin, 'useTextNameSelection')
                }
            }
            return
        }

        const exists = names.some(g =>
            g.path === parsedUrlFromParams.path && g.items.some(i =>
                i.filename === parsedUrlFromParams.filename
            )
        )

        if (!exists) {
            toast.error("Testo specificato non trovato", {id: 'TextNotExist'})
            if (selected) {
                globalState.setSelectedText(page, side, selected)
                setBatchedParams({
                    [paramKey]: `${selected.path}:${selected.items.filename}`,
                    [`${paramKey}line`]: '0'
                }, origin, 'useTextNameSelection')
            }
        }
    }, [])

    return {
        selected,
        setSelected,
        deleteText
    }
}
