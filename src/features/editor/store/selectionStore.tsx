import { createStore } from 'zustand/vanilla'
import { useStore } from 'zustand'
import { createContext, useContext, useRef, ReactNode } from 'react'
import { useSearchParams } from 'react-router'
import {
    initialSelectionState,
    SelectionRange,
    SelectionPerSide,
    SearchType,
    selectionReducer
} from "@/features/editor/reducer/selectionReducer.ts"

export type SelectionStore = {
    selectionState: {
        selectedRange: SelectionRange
        selectedRangePerLine: SelectionPerSide
    }

    dispatchSelection: (action: any) => void
    clearSelection: () => void

    searchElement: SearchType
    setSearchElement: (searchElement: SearchType) => void
    reset: () => void
    
    initialUrlParams: Record<string, string | null>
    //consumeUrlParam: (key: string) => string | null
}

export const createSelectionStore = (initialParams: Record<string, string | null> = {}) => createStore<SelectionStore>((set) => ({
    selectionState: initialSelectionState,

    dispatchSelection: (action) => set((state) => ({
        selectionState: selectionReducer(state.selectionState, action)
    })),

    clearSelection: () => set((state) => ({
        selectionState: selectionReducer(state.selectionState, { type: 'CLEAR_SELECTION' })
    })),

    searchElement: undefined,
    setSearchElement: (searchElement) => set({ searchElement }),
    
    reset: () => set({
        selectionState: initialSelectionState,
        searchElement: undefined
    }),
    
    initialUrlParams: initialParams,
}))

const SelectionStoreContext = createContext<ReturnType<typeof createSelectionStore> | null>(null)

export function SelectionStoreProvider({ children }: { children: ReactNode }) {
    const storeRef = useRef<ReturnType<typeof createSelectionStore> | null>(null)
    const [searchParams] = useSearchParams()

    if (!storeRef.current) {
        const initialParams: Record<string, string | null> = {
            hline: searchParams.get('hline'),
            bline: searchParams.get('bline'),
            start: searchParams.get('start'),
        }
        storeRef.current = createSelectionStore(initialParams)
    }
    return (
        <SelectionStoreContext.Provider value={storeRef.current}>
            {children}
        </SelectionStoreContext.Provider>
    )
}

export function selectionStore<T>(selector: (state: SelectionStore) => T): T {
    const store = useContext(SelectionStoreContext)
    if (!store)
        throw new Error('Missing SelectionStoreProvider in the component tree')
    return useStore(store, selector)
}
