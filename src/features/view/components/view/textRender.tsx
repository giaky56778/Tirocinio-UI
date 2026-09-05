import {ShowLineType} from "@/utils/commonUtil.ts";
import {TextType} from "@/utils/settings.ts";
import RenderPreviewCardText from "@/components/ui/common/renderPreviewCardText.tsx";

type RenderPreviewCardTextProps={
    text: ShowLineType[];
    color: string;
    side: TextType;
    rowId: string;
}

const TextRender =({text,color,side,rowId}: RenderPreviewCardTextProps) => {
    const spl=rowId.split('_')
    return(
        <div className="mb-3 space-y-1">
            <div className="flex items-center gap-2">
                {side === "biblical" ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-green-100 text-green-800">Storico</span>
                ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-orange-100 text-orange-800">Biblico</span>
                )}
                <span className="text-xs text-slate-500">dal <b>capitolo {spl[0]}</b>, <b>riga {spl[1]}</b></span>
            </div>
            <RenderPreviewCardText
                text={text}
                color={color}
                side={side}
            />
        </div>
    )
}

export default TextRender
