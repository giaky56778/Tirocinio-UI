import {Side} from "./highlightRow.tsx";
import {Word} from "@/utils/JSONSchema.ts";
import {HighlightStateType} from "@/hooks/useHighlightEditor.ts";
import HandGrip from "@/components/editor/row/handGrip.tsx";

const MARKER = "absolute z-[100] w-0 h-0 border-l-4 border-r-4 border-l-transparent border-r-transparent"
const START_MARKER = MARKER + " -top-1 left-0 border-t-[5px] border-t-[#1976d2]"
const END_MARKER = MARKER + " -bottom-1 right-0 border-b-[5px] border-b-[#1976d2]"

type WordSpanProps = {
    side: Side
    w: Word
    isFirstWord: boolean
    isLastWord: boolean
    showHandles: boolean
    highlightState: HighlightStateType
}

const SingleWord =({side, w, isFirstWord, isLastWord, showHandles, highlightState}: WordSpanProps) =>(
    <span
        key={`${side}-${w.ID}`}
        className="whitespace-pre-wrap relative"
        data-word-id={w.ID}
    >
        {isFirstWord && !showHandles && (
            <span className={START_MARKER} aria-hidden="true" />
        )}
        {showHandles && isFirstWord && (
            <HandGrip
                side={'left'}
                onPointerDown={(event) => {
                    event.stopPropagation();
                    highlightState.selectHandle('left');
                }}
            />
        )}
        {w.word}
        {showHandles && isLastWord && (
            <HandGrip
                side={'right'}
                onPointerDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    highlightState.selectHandle('right');
                }}
            />
        )}
        {isLastWord && !showHandles && (
            <span className={END_MARKER} aria-hidden="true" />
        )}
        {' '}
    </span>
)

export default SingleWord
