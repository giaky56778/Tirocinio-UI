import {createContext, useContext, useRef, ReactNode} from 'react'
import {createStore} from 'zustand/vanilla'
import {useStore} from 'zustand'
import {wordHighlightReducer, stateType, actionType, initState} from '@/features/editor/reducer/wordHighlightReducer.ts'
import {HighlightDouble} from '@/features/double-editor/components/doubleEditor.tsx'
import {TextType} from '@/utils/settings.ts'
import {getSideHighlight} from "@/features/editor/lib/utils.ts";

export type HighlightStore = {
    historical: stateType
    biblical: stateType
    colors: Record<string, string>
    isPreview: boolean
    sideToModify: TextType | null

    init: (highlights: Record<string, HighlightDouble>, historicalIndex: any, biblicalIndex: any) => void
    dispatch: (side: TextType, action: actionType) => void
    setColor: (highlightId: string, color: string) => void
    setSideToModify: (side: TextType | null) => void
    removeHighlight: (highlightId: string|null) => void
    reset: () => void
}

export const createHighlightStore = () => createStore<HighlightStore>((set) => ({
    historical: initState({ indexPerLine: null, highlightWords: undefined }),
    biblical: initState({ indexPerLine: null, highlightWords: undefined }),
    colors: {},
    sideToModify: null,
    isPreview: false,

    init: (highlights, historicalIndex, biblicalIndex) => {
        const colors: Record<string, string> = {}
        for (const id in highlights) {
            colors[id] = highlights[id].color
        }
        const h= getSideHighlight(highlights, 'historical')
        const b= getSideHighlight(highlights, 'biblical')
        set({
            colors,
            historical: initState({ indexPerLine: historicalIndex, highlightWords: h }),
            biblical: initState({ indexPerLine: biblicalIndex, highlightWords: b}),
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
            historical: wordHighlightReducer(state.historical, { type: "REMOVE_HIGHLIGHT", payload: { highlightId: id } }),
            biblical: wordHighlightReducer(state.biblical, { type: "REMOVE_HIGHLIGHT", payload: { highlightId: id } })
        }
    }),

    reset: () => set({
        historical: initState({ indexPerLine: null, highlightWords: undefined }),
        biblical: initState({ indexPerLine: null, highlightWords: undefined }),
        colors: {}
    })
}))

const HighlightStoreContext = createContext<ReturnType<typeof createHighlightStore> | null>(null)

export function HighlightStoreProvider({ children }: { children: ReactNode }) {
    const storeRef = useRef<ReturnType<typeof createHighlightStore> | null>(null)
    if (!storeRef.current) {
        storeRef.current = createHighlightStore()
    }
    return (
        <HighlightStoreContext.Provider value={storeRef.current}>
            {children}
        </HighlightStoreContext.Provider>
    )
}

export function highlightStore<T>(selector: (state: HighlightStore) => T): T {
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