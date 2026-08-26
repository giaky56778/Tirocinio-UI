import { createStore } from 'zustand/vanilla'
import { useStore } from 'zustand'
import { createContext, useContext, useRef, ReactNode, createElement } from 'react'
import {
    initialSelectionState,
    SelectionRange,
    SelectionPerSide,
    SearchType,
    selectionReducer
} from "@/components/reducer/selectionReducer.ts"

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
}

export const createSelectionStore = () => createStore<SelectionStore>((set) => ({
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
    })
}))

export const SelectionStoreContext = createContext<ReturnType<typeof createSelectionStore> | null>(null)

export function SelectionStoreProvider({ children }: { children: ReactNode }) {
    const storeRef = useRef<ReturnType<typeof createSelectionStore>>(null)
    if (!storeRef.current) {
        storeRef.current = createSelectionStore()
    }
    return createElement(SelectionStoreContext.Provider, { value: storeRef.current }, children)
}

export function useSelectionStore<T>(selector: (state: SelectionStore) => T): T {
    const store = useContext(SelectionStoreContext)
    if (!store)
        throw new Error('Missing SelectionStoreProvider in the component tree')
    return useStore(store, selector)
}
