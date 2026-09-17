import {Suspense} from "react";
import {VList} from "virtua";
import {Tabs} from "@base-ui/react/tabs";
import ComboboxTextName from "@/features/editor/components/editor/comboboxTextName.tsx";
import VisualizeHighlightsSkeleton from "@/features/view/components/skeleton/visualizeHighlightsSkeleton.tsx";
import CardHighlight from "@/features/view/components/view/cardHighlight.tsx";
import ErrorBoundary from "@/components/layout/errorBoundary.tsx";
import NoTextView from "@/features/view/components/no-element/noTextView.tsx";
import NoHighlightsShow from "@/features/view/components/no-element/noHighlightsShow.tsx";
import {useVisualizeAllHighlight} from "@/features/view/hook/useVisualizeAllHighlgiht.ts";
import usePage from "@/features/view/hook/usePage.ts";

export const VISUALIZE_CONTAINER_CLASS = "flex flex-col h-screen bg-slate-50/30"
export const VISUALIZE_HEADER_CLASS = "h-24 relative flex-none bg-white border-b border-slate-200 px-6 py-3.5 flex items-center shadow-2xs"
export const VISUALIZE_CONTENT_CLASS = "flex-1 flex overflow-hidden"
export const VISUALIZE_SIDEBAR_CLASS = "relative flex-none w-64 flex flex-col gap-1 overflow-y-auto border-r border-slate-200 bg-white py-3 px-2"
export const VISUALIZE_TAB_ITEM_CLASS = "relative flex items-center justify-between rounded-lg px-3 py-2.5 text-left outline-none cursor-pointer text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900 data-active:bg-orange-50 data-active:font-semibold group"
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

    const {namesQuery, highlightsTextQuery,selected,opText,biblicalNamesQuery} = useVisualizeAllHighlight()
    const {showPage, setShowPage, select} = usePage(opText.setSelected)

    const names = namesQuery.data ?? []
    const data = highlightsTextQuery.data
    const length = data?.length ?? 0

    if (names.length === 0)
        return <NoTextView />

    if (highlightsTextQuery.data === undefined || selected === undefined || highlightsTextQuery.isLoading === undefined)
        return <VisualizeHighlightsSkeleton/>

    return (
        <div className={VISUALIZE_CONTAINER_CLASS}>
            <header className={VISUALIZE_HEADER_CLASS}>
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-base font-bold text-slate-900 leading-none">Visualizza Evidenziazioni</h1>
                        <p className="text-xs text-slate-500 mt-1">Citazioni confermate tra i testi storici e biblici</p>
                    </div>
                </div>
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-3 w-max">
                    <ComboboxTextName
                        side={"historical"}
                        textNames={names}
                        textNameSelect={selected!}
                        textOp={{
                            select: select,
                            delete: opText.deleteText
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
                            onValueChange={(value) => setShowPage(Number(value))}
                            className="flex flex-1 min-h-0 overflow-hidden"
                        >
                            <Tabs.List className={VISUALIZE_SIDEBAR_CLASS}>
                                {data.map((page, idx) => (
                                    <Tabs.Tab
                                        key={idx}
                                        value={idx.toString()}
                                        className={VISUALIZE_TAB_ITEM_CLASS}
                                    >
                                        <div className="min-w-0 flex-1 pr-2">
                                            <div className="w-full truncate text-sm font-medium leading-snug">{page.filename}</div>
                                            <div className="w-full truncate text-xs text-slate-400 font-normal">{page.path}</div>
                                        </div>
                                        <span className="shrink-0 px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 group-data-active:text-orange-800">
                                            {page.highlights.length}
                                        </span>
                                    </Tabs.Tab>
                                ))}
                                <Tabs.Indicator className="absolute left-0 top-0 w-1 rounded-r-full bg-orange-600 translate-y-(--active-tab-top) h-(--active-tab-height) transition-all duration-200 ease-out" />
                            </Tabs.List>

                            {data.map((page, idx) => (
                                <Tabs.Panel
                                    key={idx}
                                    value={idx.toString()}
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
                                                biblicalNames={biblicalNamesQuery.data ?? []}
                                                showPage={showPage}
                                            />
                                        )}
                                    </VList>
                                </Tabs.Panel>
                            ))}
                        </Tabs.Root>
                    ) : (
                        <NoHighlightsShow selected={selected}/>
                    )
                }
            </div>
        </div>
    )
}

export default VisualizeHighlights
