import {useCallback, useState} from "react";
import {type Dialog} from "@base-ui/react/dialog";
import {useGlobalState} from "@/contexts/globalState.tsx";
import {fetchEventSource} from "@microsoft/fetch-event-source";
import {authFetch} from "@/api/authFetch.ts";

type SearchFilenameType = {
    filename: string
    total_size: number
}

type Props={
    dialogHandle: Dialog.Handle<never>,
    initialResultFilename?: {
        filename: string
        total_size: number
    }
}

export default function useSSESearch({dialogHandle, initialResultFilename}: Props) {

    const [messages, setMessages] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [hasError, setHasError] = useState<boolean>(false)
    const [algoFinished, setAlgoFinished] = useState<Record<string, boolean>>({})
    const globalState=useGlobalState()
    const [resultFilename, setResultFilenamePrivate] = useState<SearchFilenameType>(() => initialResultFilename ?? {
        filename:'',
        total_size:0
    })

    const setResultFilename = useCallback((filename: SearchFilenameType) => {
        setResultFilenamePrivate(filename)
        globalState.setSearch({ resultFilename: filename })
    }, [globalState])

    const handleSearch = useCallback(async (
        searchQuery: string,
        sourcesSelected: string[],
        algoSelected: string[]
    ) => {

        function resetState() {
            setMessages([])
            setHasError(false)
            dialogHandle.open(null)
            setIsLoading(true)
            setAlgoFinished({})
            setResultFilename({
                filename: '',
                total_size: 0
            })
        }

        resetState()

        try {
            const params = new URLSearchParams()
            params.append("fulltext", searchQuery)
            params.append("sources", sourcesSelected.join(""))
            algoSelected.forEach((algo) => params.append("algoList", algo))

            await authFetch(`${import.meta.env.VITE_SERVER_URL}/api/v1/search/hybridSearch?${params}`, {
                method: "GET",
                headers: {"Content-Type": "application/json"},
            });

            Object.entries(algoSelected).forEach(([, algo]) => {
                setAlgoFinished((prev) => ({...prev, [algo]: false}))
            })

            const ctrl = new AbortController();
            const close=()=>{
                ctrl.abort();
                setIsLoading(false)
            }

            await fetchEventSource(`${import.meta.env.VITE_SERVER_URL}/api/v1/search/hybridSearch?${params}`, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: 'include',
                signal: ctrl.signal,
                onmessage(event) {
                    if (event.event === "search-start") {
                        try {
                            setMessages((prev) => [...prev, `Inizio della ricerca in corso, Attendere...`])
                        } catch (error) {
                            setMessages((prev) => [...prev, event.data, String(error)])
                            setHasError(true)
                        }
                    } else if (event.event === "search-complete") {
                        try {
                            const data = JSON.parse(event.data)
                            setAlgoFinished((prev) => ({...prev, [data.algo]: true}))
                            setMessages((prev) => [...prev, `Ricerca completata: ${data.algo}`])
                        } catch (error) {
                            setMessages((prev) => [...prev, event.data, String(error)])
                            setHasError(true)
                        }
                    } else if (event.event === "complete") {
                        try {
                            const data = JSON.parse(event.data);
                            setMessages((prev) => [...prev, `Elaborazione completata: ${data.filename}`]);
                            setResultFilename({
                                filename:data.filename,
                                total_size:data.total_results,
                            })
                            close()
                        } catch (error) {
                            setMessages((prev) => [...prev, event.data, String(error)])
                            setHasError(true)
                            close()
                        }
                    }
                },
                onerror(error) {
                    setMessages((prev) => [...prev, `Errore nella comunicazione con il server: ${error instanceof Error ? error.message : "Errore sconosciuto"}`])
                    setHasError(true)
                    close()
                    throw error
                }
            })

        } catch (error) {
            setMessages((prev) => [...prev, `Errore: ${error instanceof Error ? error.message : "Errore sconosciuto"}`])
            setHasError(true)
            setIsLoading(false)
        }
    }, [dialogHandle, setResultFilename])

    return{
        handleSearch,
        sseData: {
            isLoading,
            algoFinished,
            messages,
            resultFilename,
            hasError
        }
    }
}
