import {
  createContext,
  useContext,
  useMemo,
  useState,
  useRef,
  useCallback,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  type RefObject
} from "react";
import {TextSelectedType} from "@/hook/useTextNameSelection.ts";
import {SearchType} from "@/features/editor/reducer/selectionReducer.ts";
import {TextType} from "@/utils/settings.ts";

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
  editor: EditorPageType | undefined
  search: SearchPageType | undefined
  view: ViewPageType | undefined
}

export type GlobalStateContextType = {
  swapPage: {
    state: GlobalStateType
    setState: Dispatch<SetStateAction<GlobalStateType>>
    getSelectedText: (page: PageType, side?: TextType) => {
      text?: TextSelectedType
      linePos?: number
    } | undefined
    setSelectedText: (page: PageType, side: TextType | undefined, newValue:TextSelectedType) => void
    editorRef: RefObject<Partial<EditorPageType>>
    searchRef: RefObject<Partial<SearchPageType>>
    viewRef: RefObject<Partial<ViewPageType>>
    confirmExit: () => void
  }
  initPage: {
    resetInitialMount: (page: InitialPage) => void
    consumeInitialMount: (page: InitialPage) => void
    getIsInitialMount: (page: InitialPage) => boolean
  }
}

export type InitialPage = "editor" | "search" | "view" | "searchParams" | "readonly" | "doubleReadonly"

const GlobalContext = createContext<GlobalStateContextType | undefined>(undefined);

export const GlobalStateProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<GlobalStateType>({
    editor: undefined,
    search: undefined,
    view: undefined
  })

  const editorRef = useRef<Partial<EditorPageType>>({})
  const searchRef = useRef<Partial<SearchPageType>>({})
  const viewRef = useRef<Partial<ViewPageType>>({})

  const initialMountRef = useRef<Record<InitialPage, boolean>>({
    editor: true,
    search: true,
    searchParams: true,
    view: true,
    readonly: true,
    doubleReadonly: true
  })

  const consumeInitialMount = useCallback((page: InitialPage) => {
    initialMountRef.current[page] = false
  }, [])

  const getIsInitialMount = useCallback((page: InitialPage) => {
    return initialMountRef.current[page]
  }, [])

  const resetInitialMount = useCallback((page: InitialPage) => {
    initialMountRef.current[page] = true
  }, [])

  const getSelectedText = useCallback((page: PageType, side: TextType = 'historical') => {
    switch (page) {
      case 'editor':
        return {
          text: (side === 'historical' ? editorRef.current.historical : editorRef.current.biblical) ?? state.editor?.[side],
          linePos: editorRef.current.linePos?.[side] ?? state.editor?.linePos?.[side]
        }
      case 'search':
        return {
          text: searchRef.current.text ?? state.search?.text,
          linePos: searchRef.current.linePos ?? state.search?.linePos
        };
      case 'view':
        return {
          text: viewRef.current.text ?? state.view?.text
        };
      default:
        return undefined;
    }
  }, [state]);

  const setSelectedText = useCallback((
    page: PageType,
    side: TextType = 'historical',
    newValue: TextSelectedType
  ) => {
    const nextSelected = newValue

    switch (page) {
      case 'editor':
        if (!editorRef.current.linePos)
            editorRef.current.linePos = {
              historical: 0,
              biblical: 0
            }
        if (side === 'historical') {
          editorRef.current.historical = nextSelected
          editorRef.current.linePos.historical = 0
        } else {
          editorRef.current.biblical = nextSelected
          editorRef.current.linePos.biblical = 0
        }
        break
      case 'search':
        searchRef.current.text = nextSelected
        searchRef.current.linePos = 0
        break
      case 'view':
        viewRef.current.text = nextSelected
        break
    }
  }, [state])

  const confirmExit = useCallback(() => {
    setState(prevState => ({
      editor: {
        ...prevState.editor,
        ...editorRef.current
      },
      search: {
        ...prevState.search,
        ...searchRef.current,
      },
      view: {
        ...prevState.view,
        ...viewRef.current,
      }
    }))
  }, [])

  const value = useMemo(
    () => ({
      swapPage: {
        state, setState,
        getSelectedText, setSelectedText,
        editorRef, searchRef, viewRef,
        confirmExit
      },
      initPage: {
        consumeInitialMount, getIsInitialMount,resetInitialMount
      }
    }),
    [state, getSelectedText, setSelectedText, confirmExit, consumeInitialMount, getIsInitialMount, resetInitialMount]
  )

  return (
      <GlobalContext.Provider value={value}>
        {children}
      </GlobalContext.Provider>
  )
}

export const useGlobalState = () => {
  const ctx = useContext(GlobalContext)
  if (!ctx)
    throw new Error("useGlobalState must be used within GlobalProvider")
  return ctx
}
