import {useCallback, useEffect, useState} from "react";
import {useSearchParams} from "react-router";
import toast from "react-hot-toast";
import {UseSuspenseQueryResult} from "@tanstack/react-query";
import {PageType, useGlobalState} from "@/contexts/globalState.tsx";
import {useBatchedSearchParams} from "@/contexts/paramsProvider.tsx";
import {TextType} from "@/utils/settings.ts";
import {ContentItemText, TextListSchema} from "@/api/indexType.ts";
import {useDeleteHistoricalText} from "@/hook/useDeleteText.ts";
import {UrlPath} from "@/features/editor/lib/utils.ts";

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

export type TextSelectedType = {
    path: string
    items: ContentItemText
}

type TextNameSelectionConfig = {
    namesQuery: UseSuspenseQueryResult<TextListSchema, Error>
    initUrl?: UrlPath
    side: TextType
    page: PageType
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

export default function useTextNameSelection({namesQuery, initUrl, side, page}: TextNameSelectionConfig) {
    const names = namesQuery.data ?? []
    const paramKey = side === 'historical' ? 'h':'b'
    const origin = page === 'editor' ? '/' : page === 'search' ? '/search' : '/viewHighlights'

    const [searchParams] = useSearchParams()
    const useDelete=useDeleteHistoricalText()
    const globalState = useGlobalState()
    const setBatchedParams = useBatchedSearchParams()

    const [selected, setSelectedState] = useState<TextSelectedType | undefined>(() => {
        if (names.length === 0)
            return undefined

        const urlString = searchParams.get(paramKey)

        const parsedUrlFromParams = urlToPath(urlString,undefined)
        const globalSelected = globalState.swapPage.getSelectedText(page, side)

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

        setSelectedState(newSelected)
        globalState.swapPage.setSelectedText(page, side, newSelected)

        const newParams: Record<string, string> = {
            [paramKey]: `${newSelected.path}:${newSelected.items.filename}`,
            [`${paramKey}line`]: '0'
        }

        setBatchedParams(newParams, origin)
    }, [paramKey, setBatchedParams, globalState, page, side])

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

        const exists = names.some(g => g.path === parsedUrlFromParams.path && g.items.some(i => i.filename === parsedUrlFromParams.filename))

        if (!exists) {
            toast.error("Testo specificato non trovato", {id: 'TextNotExist'})
            if (selected) {
                setSelected(selected)
            }
        }
    }, [])

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
        useDelete.mutate({ id })

    }, [selected, names, setSelected])

    return {
        selected,
        setSelected,
        deleteText
    }
}
