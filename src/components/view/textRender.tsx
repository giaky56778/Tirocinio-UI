import {ShowLineType} from "@/utils/util.ts";
import {Side} from "@/utils/globalType.ts";
import RenderPreviewCardText from "@/components/editor/previewCard/renderPreviewCardText.tsx";

type RenderPreviewCardTextProps={
    text: ShowLineType[];
    color: string;
    side: Side;
    rowId: string;
}

const TextRender =({text,color,side,rowId}: RenderPreviewCardTextProps) => {
    const spl=rowId.split(':')
    return(
        <div className="mb-3 space-y-1">
            <div className="flex items-center gap-2">
                {side === "historical" ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-green-100 text-green-800">Storico</span>
                ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-800">Biblico</span>
                )}
                <span className="text-xs text-slate-500">dal <b>capitolo {spl[0]}</b>, <b>riga {spl[1]}</b></span>
            </div>
            <RenderPreviewCardText text={text} color={color} side={side}/>
        </div>
    )
}

export default TextRender
