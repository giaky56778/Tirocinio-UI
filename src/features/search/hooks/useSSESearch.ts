import React, {useCallback, useState} from "react";
import {Dialog} from "@base-ui/react/dialog";
import {useGlobalState} from "@/contexts/globalState.tsx";

type SearchFilenameType = {
    filename: string
    total_size: number
}

type Props={
    dialogHandle:  React.RefObject<Dialog.Handle<any>>,
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
        globalState.swapPage.searchRef.current.resultFilename = filename
    }, [globalState])

    const handleSearch = useCallback(async (
        searchQuery: string,
        sourcesSelected: string[],
        algoSelected: string[]
    ) => {

        function resetState() {
            setMessages([])
            setHasError(false)
            dialogHandle.current.open(null)
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

            await fetch(`${import.meta.env.VITE_SERVER_URL}/api/v1/search/hybridSearch?${params}`, {
                method: "GET",
                headers: {"Content-Type": "application/json"},
            });

            Object.entries(algoSelected).forEach(([_, algo]) => {
                setAlgoFinished((prev) => ({...prev, [algo]: false}))
            })

            const eventSource = new EventSource(`${import.meta.env.VITE_SERVER_URL}/api/v1/search/hybridSearch?${params}`)

            const close=()=>{
                eventSource.close()
                setIsLoading(false)
            }

            eventSource.addEventListener("search-start", (event) => {
                try {
                    setMessages((prev) => [...prev, `Inizio della ricerca in corso, Attendere...`])
                } catch (error) {
                    setMessages((prev) => [...prev, event.data, error])
                    setHasError(true)
                }
            })

            eventSource.addEventListener("search-complete", (event) => {
                try {
                    const data = JSON.parse(event.data)
                    setAlgoFinished((prev) => ({...prev, [data.algo]: true}))
                    setMessages((prev) => [...prev, `Ricerca completata: ${data.algo}`])
                } catch (error) {
                    setMessages((prev) => [...prev, event.data, error])
                    setHasError(true)
                }
            })

            eventSource.addEventListener("complete", async (event) => {
                try {
                    const data = JSON.parse(event.data);
                    setMessages((prev) => [...prev, `Elaborazione completata: ${data.filename}`]);
                    setResultFilename({
                        filename:data.filename,
                        total_size:data.total_results,
                    })
                    close()
                } catch (error) {
                    setMessages((prev) => [...prev, event.data, error])
                    setHasError(true)
                    close()
                }
            })

            eventSource.onerror = (error) => {
                setMessages((prev) => [...prev, `Errore nella comunicazione con il server: ${error instanceof Error ? error.message : "Errore sconosciuto"}`])
                setHasError(true)
                close()
            }
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
