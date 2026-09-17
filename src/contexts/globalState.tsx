import { create } from 'zustand'
import type {TextSelectedType} from "@/hook/useTextNameSelection.ts";
import type {SearchType} from "@/features/editor/reducer/selectionReducer.ts";
import type {TextType} from "@/utils/settings.ts";

export type PageType = 'editor' | 'search' | 'view';

export type EditorPageType = {
  historical?: TextSelectedType
  biblical?: TextSelectedType
  linePos?: {
    historical: number
    biblical: number
  }
}

export type SearchPageType = {
  text?: TextSelectedType
  linePos?: number
  algoSelected?: string[]
  sourcesSelected?: string[]
  searchQuery?: string
  confirmedSearch?: SearchType
  search?: SearchType
  resultFilename?: {
    filename: string
    total_size: number
  }
}

export type ViewPageType = {
  text?: TextSelectedType
  page?: number
}

export type GlobalStateType = {
  editor: Partial<EditorPageType>
  search: Partial<SearchPageType>
  view: Partial<ViewPageType>
}

export type InitialPage = "editor" | "search" | "view" | "searchParams" | "readonly" | "doubleReadonly"

export type GlobalStore = {
  state: GlobalStateType
  initialMount: Record<InitialPage, boolean>

  setEditor: (updater: Partial<EditorPageType> | ((prev: Partial<EditorPageType>) => Partial<EditorPageType>)) => void
  setSearch: (updater: Partial<SearchPageType> | ((prev: Partial<SearchPageType>) => Partial<SearchPageType>)) => void
  setView: (updater: Partial<ViewPageType> | ((prev: Partial<ViewPageType>) => Partial<ViewPageType>)) => void

  getSelectedText: (page: PageType, side?: TextType) => { text?: TextSelectedType, linePos?: number } | undefined
  setSelectedText: (page: PageType, side: TextType | undefined, newValue: TextSelectedType) => void

  initPage: {
    resetInitialMount: (page: InitialPage) => void
    consumeInitialMount: (page: InitialPage) => void
    getIsInitialMount: (page: InitialPage) => boolean
  }
}

export const useGlobalState = create<GlobalStore>((set, get) => ({
  state: {
    editor: {},
    search: {},
    view: {}
  },
  
  initialMount: {
    editor: true,
    search: true,
    searchParams: true,
    view: true,
    readonly: true,
    doubleReadonly: true
  },

  setEditor: (updater) => set((store) => ({
    state: { ...store.state, editor: { ...store.state.editor, ...(typeof updater === 'function' ? updater(store.state.editor) : updater) } }
  })),

  setSearch: (updater) => set((store) => ({
    state: { ...store.state, search: { ...store.state.search, ...(typeof updater === 'function' ? updater(store.state.search) : updater) } }
  })),

  setView: (updater) => set((store) => ({
    state: { ...store.state, view: { ...store.state.view, ...(typeof updater === 'function' ? updater(store.state.view) : updater) } }
  })),

  getSelectedText: (page: PageType, side: TextType = 'historical') => {
    const state = get().state
    switch (page) {
      case 'editor':
        return {
          text: side === 'historical' ? state.editor.historical : state.editor.biblical,
          linePos: state.editor.linePos?.[side]
        }
      case 'search':
        return {
          text: state.search.text,
          linePos: state.search.linePos
        };
      case 'view':
        return {
          text: state.view.text
        };
      default:
        return undefined
    }
  },

  setSelectedText: (page: PageType, side: TextType = 'historical', newValue: TextSelectedType) => {
    switch (page) {
      case 'editor': {
        const currentLinePos = get().state.editor.linePos || { historical: 0, biblical: 0 }
        if (side === 'historical') {
          get().setEditor({ historical: newValue, linePos: { ...currentLinePos, historical: 0 } })
        } else {
          get().setEditor({ biblical: newValue, linePos: { ...currentLinePos, biblical: 0 } })
        }
        break
      }
      case 'search':
        get().setSearch({ text: newValue, linePos: 0 })
        break
      case 'view':
        get().setView({ text: newValue })
        break
    }
  },

  initPage: {
    consumeInitialMount: (page) => set(store => !store.initialMount[page] ? {} : ({ initialMount: { ...store.initialMount, [page]: false } } )),
    getIsInitialMount: (page) => get().initialMount[page],
    resetInitialMount: (page) => set(store => !store.initialMount[page] ? {} : ({ initialMount: { ...store.initialMount, [page]: true } } ))
  }
}))
