type HandGripProps = {
    side:'left'|'right',
    onPointerDown: (e: any) => void
}

const HAND_LEFT= "-left-3 z-[1000]"
const HAND_RIGHT= "-right-3 z-[1000]"

const HandGrip=({side, onPointerDown}: HandGripProps) => (
    <svg
        className={`cursor-col-resize select-none absolute -top-2 w-6 h-[calc(100%+16px)] z-10 pointer-events-auto ${side === 'left' ? HAND_LEFT : HAND_RIGHT}`}
        onPointerDown={onPointerDown}
    >
        <circle cx="12" cy="5" r="4" fill="#1976d2" stroke="#0d47a1" strokeWidth="1"/>
        <line x1="12" y1="9" x2="12" y2="100%" stroke="#1976d2" strokeWidth="2"/>
    </svg>
)

export default HandGrip
