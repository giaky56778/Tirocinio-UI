import { createStore } from 'zustand/vanilla'
import { useStore } from 'zustand'
import { createContext, useContext, useRef, ReactNode, createElement } from 'react'
import { wordHighlightReducer, stateType, actionType, initState } from '@/components/reducer/wordHighlightReducer.ts'
import { HighlightDouble } from '@/components/editor/doubleEditor.tsx'
import { Side } from '@/utils/globalType.ts'
import {getSideHighlight} from "@/utils/util.ts";

export type HighlightStore = {
    biblical: stateType
    historical: stateType
    colors: Record<string, string>
    isPreview: boolean
    sideToModify: Side | null

    init: (highlights: Record<string, HighlightDouble>, biblicalIndex: any, historicalIndex: any) => void
    dispatch: (side: Side, action: actionType) => void
    setColor: (highlightId: string, color: string) => void
    setSideToModify: (side: Side | null) => void
    removeHighlight: (highlightId: string|null) => void
    reset: () => void
}

export const createHighlightStore = () => createStore<HighlightStore>((set) => ({
    biblical: initState({ indexPerLine: null, highlightWords: undefined }),
    historical: initState({ indexPerLine: null, highlightWords: undefined }),
    colors: {},
    sideToModify: null,
    isPreview: false,

    init: (highlights, biblicalIndex, historicalIndex) => {
        const colors: Record<string, string> = {}
        for (const id in highlights) {
            colors[id] = highlights[id].color
        }
        set({
            colors,
            biblical: initState({ indexPerLine: biblicalIndex, highlightWords: getSideHighlight(highlights, 'biblical') }),
            historical: initState({ indexPerLine: historicalIndex, highlightWords: getSideHighlight(highlights, 'historical') }),
            isPreview: Object.keys(highlights).some(id => id === 'preview-highlight')
        })
    },

    dispatch: (side, action) => set((state) => ({
        [side]: wordHighlightReducer(state[side], action)
    })),

    setColor: (id, color) => set((state) => ({
        colors: { ...state.colors, [id]: color }
    })),

    setSideToModify: (side) => set({ sideToModify: side }),

    removeHighlight: (id:string|null) => set((state) => {

        if(id === null)
            return state

        const { [id]: _, ...newColors } = state.colors
        return {
            colors: newColors,
            biblical: wordHighlightReducer(state.biblical, { type: "REMOVE_HIGHLIGHT", payload: { highlightId: id } }),
            historical: wordHighlightReducer(state.historical, { type: "REMOVE_HIGHLIGHT", payload: { highlightId: id } })
        }
    }),

    reset: () => set({
        biblical: initState({ indexPerLine: null, highlightWords: undefined }),
        historical: initState({ indexPerLine: null, highlightWords: undefined }),
        colors: {},
        sideToModify: null
    })
}))

export const HighlightStoreContext = createContext<ReturnType<typeof createHighlightStore> | null>(null)

export function HighlightStoreProvider({ children }: { children: ReactNode }) {
    const storeRef = useRef<ReturnType<typeof createHighlightStore>>(null)
    if (!storeRef.current) {
        storeRef.current = createHighlightStore()
    }
    return createElement(HighlightStoreContext.Provider, { value: storeRef.current }, children)
}

export function useHighlightStore<T>(selector: (state: HighlightStore) => T): T {
    const store = useContext(HighlightStoreContext)
    if (!store)
        throw new Error('Missing HighlightStoreProvider in the component tree')
    return useStore(store, selector)
}

export function useHighlightStoreContext() {
    const store = useContext(HighlightStoreContext)
    if (!store)
        throw new Error('Missing HighlightStoreProvider in the component tree')
    return store
}