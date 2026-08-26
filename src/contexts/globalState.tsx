import {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useRef,
  type RefObject
} from "react";
import {TextSelectedType} from "@/hooks/useTextNameSelection.ts";
import {SearchType} from "@/components/reducer/selectionReducer.ts";
import {Side} from "@/utils/globalType.ts";

export type PageType = 'editor' | 'search' | 'view'

export type EditorPageType = {
  biblical?: TextSelectedType
  historical?: TextSelectedType
  linePos?: {
    biblical: number
    historical: number
  }
}

export type SearchPageType = {
  text?: TextSelectedType
  linePos?: number
  searchElement?: SearchType
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
  state: GlobalStateType
  setState: Dispatch<SetStateAction<GlobalStateType>>
  getSelectedText: (page: PageType, side?: Side) => {
    text?: TextSelectedType
    linePos?: number
  } | undefined
  setSelectedText: (page: PageType, side: Side | undefined, newValue:TextSelectedType) => void
  editorRef: RefObject<Partial<EditorPageType>>
  searchRef: RefObject<Partial<SearchPageType>>
  viewRef: RefObject<Partial<ViewPageType>>
  confirmExit: () => void
}

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

  const getSelectedText = useCallback((page: PageType, side: Side = 'biblical') => {
    switch (page) {
      case 'editor':
        return {
          text: (side === 'biblical' ? editorRef.current.biblical : editorRef.current.historical) ?? state.editor?.[side],
          linePos: state.editor?.linePos?.[side]
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
    side: Side = 'biblical',
    newValue: TextSelectedType
  ) => {
    const nextSelected = newValue

    switch (page) {
      case 'editor':
        if (side === 'biblical') {
          editorRef.current.biblical = nextSelected
        } else {
          editorRef.current.historical = nextSelected
        }
        break
      case 'search':
        searchRef.current.text = nextSelected
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
      state,
      setState,
      getSelectedText,
      setSelectedText,
      editorRef,
      searchRef,
      viewRef,
      confirmExit
    }),
    [state, getSelectedText, setSelectedText, confirmExit]
  )

  return <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>;
}

export const useGlobalState = () => {
  const ctx = useContext(GlobalContext)
  if (!ctx)
    throw new Error("useGlobalState must be used within GlobalProvider")
  return ctx
}

export default GlobalContext
