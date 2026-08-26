import {useCallback, useEffect, useMemo, useState} from "react";
import {useSearchParams} from "react-router";
import toast from "react-hot-toast";
import {UseSuspenseQueryResult} from "@tanstack/react-query";

import {UrlPath} from "@/components/page/editorPage.tsx";
import {PageType, useGlobalState} from "@/contexts/globalState.tsx";
import {urlToPath} from "@/utils/util.ts";
import {useBatchedSearchParams} from "@/contexts/paramsProvider.tsx";
import {Side} from "@/utils/globalType.ts";
import {ContentItemText, TextListSchema} from "@/utils/JSONSchema.ts";

export type TextSelectedType = {
    path: string
    items: ContentItemText
}

type TextNameSelectionConfig = {
    namesQuery: UseSuspenseQueryResult<TextListSchema, Error>
    initUrl?: UrlPath
    side: Side
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
    const paramKey = side === 'biblical' ? 'b':'h'
    const origin = page === 'editor' ? '/' : page === 'search' ? '/search' : '/viewHighlights'

    const [searchParams] = useSearchParams()
    const globalState = useGlobalState()
    const setBatchedParams = useBatchedSearchParams()

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

    useEffect(() => {
        if (namesQuery.isFetching || names.length === 0)
            return

        const urlString = searchParams.get(paramKey)
        const parsedUrlFromParams = urlToPath(urlString, undefined)
        if (!parsedUrlFromParams)
            return

        const exists = names.some(g => g.path === parsedUrlFromParams.path && g.items.some(i => i.filename === parsedUrlFromParams.filename))

        if (!exists) {
            toast.error("Testo specificato nell'URL non trovato", {id: 'TextNotExists'})
        }
    }, [names, namesQuery.isFetching, searchParams, paramKey])

    useEffect(() => {
        const urlString = searchParams.get(paramKey)
        if (selected && !urlString && names.length > 0) {
            if (!searchParams.has(paramKey)) {
                setBatchedParams({
                    [paramKey]: `${selected.path}:${selected.items.filename}`
                }, origin, 'useTextNameSelection')
            }
        }
    }, [selected, searchParams, paramKey, setBatchedParams, names.length, globalState, page, side])

    const setSelected = useCallback((newSelected: TextSelectedType) => {
        setSelectedState(newSelected)
        globalState.setSelectedText(page, side, newSelected)


        setBatchedParams({
            [paramKey]: `${newSelected.path}:${newSelected.items.filename}`
        }, origin, 'useTextNameSelection')
    }, [names, paramKey, setBatchedParams, globalState, page, side])

    const selectedItem = useMemo(() => {
        return selected?.items ?? names[0]?.items[0]
    }, [selected, names])

    return {
        selected,
        setSelected,
        selectedItem,
    }
}
