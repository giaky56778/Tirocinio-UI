type Props={
    hasStart?: boolean
    hasEnd?: boolean
}

const AccuracyError = ({hasStart, hasEnd}:Props) => (
    (hasStart && hasEnd) && (
        <div className={"absolute bottom-0 inset-x-0 z-10 bg-amber-50 border-t border-amber-200 px-3 py-1.5 text-center"}>
            <span className="text-xs text-amber-800"> Attenzione! non è preciso a livello di parola, ma solo a quello di riga</span>
        </div>
    )
)

export default AccuracyError
