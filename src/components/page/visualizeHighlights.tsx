import {Suspense, useEffect, useState} from "react";
import {Tabs} from "@base-ui/react/tabs";
import {VList} from "virtua";
import {useNavigate, useSearchParams} from "react-router";
import ComboboxTextName from "@/components/editor/comboboxTextName.tsx";
import VisualizeHighlightsSkeleton from "@/components/skeleton/visualizeHighlightsSkeleton.tsx";
import {DocumentIcon} from "@/components/icons";
import {useGlobalState} from "@/contexts/globalState.tsx";
import CardHighlight from "@/components/view/cardHighlight.tsx";
import {useVisualizeAllHighlight} from "@/hooks/useTextRead.ts";
import ErrorBoundary from "@/components/errorBoundary.tsx";
import {useBatchedSearchParams} from "@/contexts/paramsProvider.tsx";

export const VISUALIZE_CONTAINER_CLASS = "flex flex-col h-screen bg-slate-50/30"
export const VISUALIZE_HEADER_CLASS = "h-24 relative flex-none bg-white border-b border-slate-200 px-6 py-3.5 flex items-center shadow-2xs"
export const VISUALIZE_CONTENT_CLASS = "flex-1 flex overflow-hidden"
export const VISUALIZE_SIDEBAR_CLASS = "relative flex-none w-64 flex flex-col gap-1 overflow-y-auto border-r border-slate-200 bg-white py-3 px-2"
export const VISUALIZE_TAB_ITEM_CLASS = "relative flex items-center justify-between rounded-lg px-3 py-2.5 text-left outline-none cursor-pointer text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900 data-active:bg-blue-50 data-active:font-semibold group"
export const VISUALIZE_PANEL_CLASS = "flex-1 flex flex-col min-h-0 overflow-hidden bg-slate-50/50"
export const VISUALIZE_PANEL_HEADER_CLASS = "flex-none px-6 py-3.5 bg-white border-b border-slate-200 flex items-center justify-between"
export const VISUALIZE_LIST_CONTAINER_CLASS = "flex-1 min-h-0 w-full p-6"

const VisualizeHighlights=()=> (
    <ErrorBoundary>
        <Suspense fallback={<VisualizeHighlightsSkeleton/>}>
            <VisualizeHighlightsComponent/>
        </Suspense>
    </ErrorBoundary>
)

function VisualizeHighlightsComponent() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const globalState = useGlobalState()
    const setBatchedParams = useBatchedSearchParams()
    const {namesQuery, highlightsTextQuery,selected,setSelected,historicalNamesQuery} = useVisualizeAllHighlight()

    const [showPage, privateSetShowPage] = useState(() => {
        if(globalState.state.view?.page !== undefined)
            return globalState.state.view?.page
        const pageParam = searchParams.get('page')
        if (pageParam !== null) {
            const parsedPage = parseInt(pageParam)
            if (!isNaN(parsedPage)) {
                return parsedPage
            }
        }
        return 0
    })

    const names = namesQuery.data ?? []
    const data = highlightsTextQuery.data
    const length = data?.length ?? 0

    function setShowPage(page: number) {
        privateSetShowPage(page)
        globalState.viewRef.current.page = page
        setBatchedParams({page: String(page)}, '/viewHighlights', 'visualizeHighlights')
    }

    useEffect(() => {
        if(globalState.state.view?.page !== undefined){
            setBatchedParams({page: String(globalState.state.view?.page)}, '/viewHighlights', 'visualizeHighlights')
            return
        }
        if(!searchParams.has('page')){
            setBatchedParams({page: "0"}, '/viewHighlights', 'visualizeHighlights')
            return
        }
    }, [])

    useEffect(() => {
        return () => {
            globalState.viewRef.current.page = showPage
            globalState.confirmExit()
        }
    }, [showPage, globalState.confirmExit])

    if (data === undefined) {
        return <VisualizeHighlightsSkeleton/>;
    }

    if (names.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-6 bg-slate-50/50">
                <div className="max-w-md w-full text-center bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                    <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-blue-600 mb-5 shadow-inner">
                        <DocumentIcon/>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                        Nessun testo disponibile
                    </h2>
                    <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                        Non è stato ancora caricato alcun testo biblico. Carica un testo nell'Editor per poter analizzare e visualizzare le evidenziazioni collegate.
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="mt-6 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
                    >
                        Vai all'Editor
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className={VISUALIZE_CONTAINER_CLASS}>
            <header className={VISUALIZE_HEADER_CLASS}>
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-base font-bold text-slate-900 leading-none">Visualizza Evidenziazioni</h1>
                        <p className="text-xs text-slate-500 mt-1">Confronto testi biblici e storici collegati</p>
                    </div>
                </div>
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-3 w-max">
                    <ComboboxTextName
                        side={"biblical"}
                        textNames={names}
                        textNameSelect={selected!}
                        onChange={(value) => {
                            setSelected(value)
                            setShowPage(0)
                            setBatchedParams({page: "0"}, '/viewHighlights', 'visualizeHighlights')
                        }}
                    />
                </div>
            </header>

            <div className={VISUALIZE_CONTENT_CLASS}>
                {data && length > 0
                    ? (
                        <Tabs.Root
                            orientation="vertical"
                            value={String(showPage)}
                            onValueChange={(value) => {
                                setShowPage(Number(value))
                                setBatchedParams({page: value}, '/viewHighlights', 'visualizeHighlights')
                            }}
                            className="flex flex-1 min-h-0 overflow-hidden"
                        >
                            <Tabs.List className={VISUALIZE_SIDEBAR_CLASS}>
                                {data.map((page, idx) => (
                                    <Tabs.Tab
                                        key={idx}
                                        value={String(idx)}
                                        className={VISUALIZE_TAB_ITEM_CLASS}
                                    >
                                        <div className="min-w-0 flex-1 pr-2">
                                            <div className="w-full truncate text-sm font-medium leading-snug">{page.filename}</div>
                                            <div className="w-full truncate text-xs text-slate-400 font-normal">{page.path}</div>
                                        </div>
                                        <span className="shrink-0 px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 group-data-active:text-blue-800">
                                            {page.highlights.length}
                                        </span>
                                    </Tabs.Tab>
                                ))}
                                <Tabs.Indicator className="absolute left-0 top-0 w-1 rounded-r-full bg-blue-600 translate-y-(--active-tab-top) h-(--active-tab-height) transition-all duration-200 ease-out" />
                            </Tabs.List>

                            {data.map((page, idx) => (
                                <Tabs.Panel
                                    key={idx}
                                    value={String(idx)}
                                    className={VISUALIZE_PANEL_CLASS}
                                >
                                    <div className={VISUALIZE_PANEL_HEADER_CLASS}>
                                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                                            <span className="text-slate-400">{page.path}</span>
                                            <span>/</span>
                                            <span className="font-semibold text-slate-800">{page.filename}</span>
                                        </div>
                                    </div>

                                    <VList
                                        className={VISUALIZE_LIST_CONTAINER_CLASS}
                                        data={page.highlights}
                                    >
                                        {(highlight, hIdx) => (
                                            <CardHighlight
                                                index={hIdx}
                                                highlight={highlight}
                                                selected={selected}
                                                highlightData={data}
                                                historicalNames={historicalNamesQuery.data ?? []}
                                                showPage={showPage}
                                            />
                                        )}
                                    </VList>
                                </Tabs.Panel>
                            ))}
                        </Tabs.Root>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50/50">
                            <div className="max-w-md w-full text-center bg-white border border-slate-200/80 rounded-2xl p-8 shadow-xs">
                                <div className="mx-auto flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 mb-4 ring-8 ring-amber-50/40">
                                    <DocumentIcon className="size-6" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">
                                    Nessuna evidenziazione trovata
                                </h3>
                                <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                                    Il testo <b className="text-slate-700">"{selected?.items.filename}"</b> non contiene ancora evidenziazioni o collegamenti salvati.
                                </p>
                                <button
                                    onClick={() => navigate('/')}
                                    className="mt-6 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                                >
                                    Torna all'Editor
                                </button>
                            </div>
                        </div>
                    )
                }
            </div>
        </div>
    )
}

export default VisualizeHighlights
