import {type TextBundle, type TextLineItem, type TextSchema, type Word} from "@/api/indexType.ts";
import {type HighlightBound, type HighlightLine} from "@/features/editor/reducer/wordHighlightReducer.ts";
import {type SearchHighlight, type SelectionRange} from "@/features/editor/reducer/selectionReducer.ts";
import {copyHighlightText, type WordGroup} from "@/utils/commonUtil.ts";
import {colorMap, type TextType} from "@/utils/settings.ts";
import {useHighlightStore} from "@/features/editor/store/useHighlightStore.tsx";
import {type HighlightColor, type HighlightDouble} from "@/features/double-editor/components/doubleEditor.tsx";

export type UrlPath = {
    path: string
    filename: string
    scrollLine: number
}

export function composeTitle(text: Word[]) {
    return text.map(w => w.word).join(' ')
}

export function useResolveColorClass(group: WordGroup, colors: Record<string, string>): string {
    const isPreview = useHighlightStore(state => state.isPreview)
    const colorId = colors[group.highlightId]
    if (!colorId || !colorMap[colorId])
        return ''

    const colorClass = colorMap[colorId]
    return isPreview && group.highlightId!=='preview-highlight' ? colorClass.preview : colorClass.class
}

export function createGroup(
    paragraphWords: TextLineItem,
    startEndPosition: HighlightLine[],
    selectedRange: SelectionRange | HighlightLine,
    searchHighlight?: SearchHighlight,
) {
    function isWordInHighlightLine(wordId: number, line: HighlightLine): boolean {
        return line.entireLine ||
            (line.startWord !== undefined && line.endWord !== undefined && line.startWord <= wordId && line.endWord >= wordId) ||
            (line.startWord !== undefined && line.endWord === undefined && line.startWord <= wordId) ||
            (line.startWord === undefined && line.endWord !== undefined && line.endWord >= wordId);
    }

    const groups: WordGroup[] = []
    paragraphWords.text.forEach((word: Word) => {
        let isSelected = false;
        if (selectedRange) {
            if ('entireLine' in selectedRange) {
                isSelected = isWordInHighlightLine(word.ID, selectedRange as HighlightLine);
            } else {
                const r = selectedRange as NonNullable<SelectionRange>
                isSelected = word.ID >= r.start && word.ID <= r.end
            }
        }
        const searchColorId = searchHighlight && word.ID >= searchHighlight.start && word.ID <= searchHighlight.end
            ? searchHighlight.colorId
            : undefined

        const highlightLine = startEndPosition.find((h) => isWordInHighlightLine(word.ID, h))
        const highlightId = highlightLine?.highlightId ?? ''

        const last = groups[groups.length - 1]
        if (groups.length !== 0 && last.highlightId === highlightId && last.isSelected === isSelected && last.searchColorId === searchColorId) {
            last.words.push(word)
        } else {
            groups.push({words: [word], highlightId, isSelected, searchColorId})
        }
    })
    return groups
}

export function copyHighlightTextFromID({text,highlightBounds,highlightId}:{
    text:TextSchema,
    highlightBounds:Record<string,HighlightBound>,
    highlightId: string | null
}): string {
    if (highlightId == null)
        return ''

    const bound = highlightBounds[highlightId]
    if (bound == null)
        return ''

    const startWordId = bound.startWord
    const endWordId = bound.endWord
    return copyHighlightText({text,startWordId, endWordId})
}

function highlightRange({text,start,end,line}:{
    text:TextBundle
    line?:string
    start?:number
    end?:number
}){
    let firstIndex = 0
    let lastIndex = 0

    if(line){
        let logicalIndex = 0;
        let foundFirst = false;

        for(let i=0;i<text.text.length;i++){
            if(text.text[i].type==='text'){
                const temp = text.text[i] as TextLineItem
                const spl = temp.id.split('_')
                const replace = spl[0]+"."+spl[1]

                if(replace === line){
                    if(!foundFirst){
                        firstIndex = logicalIndex;
                        foundFirst = true;
                    }
                    lastIndex = logicalIndex;
                }
                logicalIndex++
            }
        }
    }

    const lineKeys = Object.keys(text.index.content)
    const firstKey = Number(lineKeys[firstIndex])
    const lastKey = Number(lineKeys[lastIndex])

    const startHighlightLine = text.index.content[firstKey]
    const endHighlightLine = text.index.content[lastKey]

    return{
        startWord: start ? start : startHighlightLine?.start,
        endWord: end ? end : endHighlightLine.end - 1
    }
}

export function createTextConfig(
    url: UrlPath,
    id: number,
    textData: TextBundle,
    start: number | undefined,
    end: number | undefined,
    line: string
) {

    const range = highlightRange({
        text: textData,
        start,
        end,
        line
    })

    return {
        selectedText: {
            path: url.path,
            items: { id, filename: url.filename }
        },
        listText: [{
            path: url.path,
            items: [{ id, filename: url.filename }]
        }],
        range
    }
}

export function parseUrn(urn: string) {
    const [spl, line] = urn.split(":")
    const filePath = spl.split(".")
    const filename = filePath.pop()!
    return {
        url: {
            filename,
            path: filePath.join("."),
            scrollLine: Number(line) || -1
        },
        line
    }
}

export function getSideHighlight(highlights: Record<string, HighlightDouble>, side: TextType) {
    if(highlights==null)
        return
    const highlightsBySide: Record<string, HighlightColor> = {}
    Object.entries(highlights).forEach(([id,h]) => {
        highlightsBySide[id]=({
            position:h[side],
            color:h.color
        })
    })
    return highlightsBySide
}
