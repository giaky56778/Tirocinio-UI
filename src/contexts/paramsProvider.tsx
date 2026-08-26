import {createContext, useContext, useRef, useCallback, ReactNode, useEffect} from "react";
import { useSearchParams } from "react-router"

type SetParamsFunction = (
    params: Record<string, string | undefined>,
    origin?: '/' | '/search' | '/viewHighlights',
    source?: string
) => void

const ParamsContext = createContext<SetParamsFunction | null>(null);

export default function ParamsProvider({ children }: { children: ReactNode }) {
    const [_, setSearchParams] = useSearchParams()

    const locationRef = useRef(location.pathname)
    useEffect(() => {
        locationRef.current = location.pathname
    }, [location.pathname])

    const pendingParams = useRef<Record<string, string | undefined>>({})
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const updateParams = useCallback((newParams: Record<string, string | undefined>, origin?: '/' | '/search' | '/viewHighlights', _source?: string) => {
        pendingParams.current = { ...pendingParams.current, ...newParams }

        if (!timeoutRef.current) {
            timeoutRef.current = setTimeout(() => {
                if (origin && locationRef.current !== origin) {
                    pendingParams.current = {}
                    timeoutRef.current = null
                    return
                }

                const next = new URLSearchParams(window.location.search) // Non usare useLocatore, il suo riferimento rimane vecchio e aggiorna l'URL con i vecchi parametri
                Object.entries(pendingParams.current).forEach(([key, value]) => {
                    if (value === undefined) {
                        next.delete(key)
                    } else {
                        next.set(key, value)
                    }
                })
                setSearchParams(next, { replace: true })

                pendingParams.current = {}
                timeoutRef.current = null
            }, 100)
        }
    }, [setSearchParams])

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
                timeoutRef.current = null
            }
        }
    }, [])

    return (
        <ParamsContext.Provider value={updateParams}>
            {children}
        </ParamsContext.Provider>
    )
}

export function useBatchedSearchParams() {
    const context = useContext(ParamsContext)
    if (!context)
        throw new Error("useBatchedSearchParams deve essere usato dentro ParamsProvider")

    return context
}
