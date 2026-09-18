import {createStore} from 'zustand/vanilla'
import {useStore} from 'zustand'
import {createContext, type ReactNode, useContext, useState} from 'react'
import {useSearchParams} from 'react-router'
import {
    initialSelectionState,
    type SearchType, type SelectionAction,
    type SelectionPerSide,
    type SelectionRange,
    selectionReducer
} from "@/features/editor/reducer/selectionReducer.ts"

export type SelectionStore = {
    selectionState: {
        selectedRange: SelectionRange
        selectedRangePerLine: SelectionPerSide
    }

    dispatchSelection:(action: SelectionAction) => void
    clearSelection:() => void

    searchElement: SearchType
    setSearchElement:(searchElement: SearchType) => void
    reset:() => void
    
    initialUrlParams: Record<string, string | null>

    isSelectionBlocked: boolean
    setSelectionBlocked: (isBlocked: boolean) => void
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

    isSelectionBlocked: false,
    setSelectionBlocked: (isSelectionBlocked) => set({ isSelectionBlocked }),
    
    reset: () => set({
        selectionState: initialSelectionState,
        searchElement: undefined,
        isSelectionBlocked: false
    }),
    
    initialUrlParams: initialParams,
}))

export function useSelectionStore<T>(selector: (state: SelectionStore) => T): T {
    const store = useContext(SelectionStoreContext)
    if (!store)
        throw new Error('Missing SelectionStoreProvider in the component tree')
    return useStore(store, selector)
}

export function useSelectionStoreContext() {
    const store = useContext(SelectionStoreContext)
    if (!store)
        throw new Error('Missing SelectionStoreProvider in the component tree')
    return store
}

const SelectionStoreContext = createContext<ReturnType<typeof createSelectionStore> | null>(null)

export function SelectionStoreProvider({ children }: { children: ReactNode }) {
    const [searchParams] = useSearchParams()
    const [store] = useState(() => {
        const initialParams: Record<string, string | null> = {
            hline: searchParams.get('hline'),
            bline: searchParams.get('bline'),
            start: searchParams.get('start')
        }
        return createSelectionStore(initialParams)
    })

    return (
        <SelectionStoreContext.Provider value={store}>
            {children}
        </SelectionStoreContext.Provider>
    )
}
