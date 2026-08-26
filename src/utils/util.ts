import React from "react";
import {TextBundle, TextIndexSchema, TextLineItem, TextSchema, Word} from "@/utils/JSONSchema.ts";
import {HighlightBound, HighlightLine} from "@/components/reducer/wordHighlightReducer.ts";
import {colorMap, LIMIT_PREVIEW_WORD, Side} from "@/utils/globalType.ts";
import {SearchHighlight, SelectionRange} from "@/components/reducer/selectionReducer.ts";
import {UrlPath} from "@/components/page/editorPage.tsx";
import {useHighlightStore} from "@/store/useHighlightStore.ts";
import {HighlightColor, HighlightDouble} from "@/components/editor/doubleEditor.tsx";


export type WordGroup = {
    words: Word[]
    highlightId: string
    isSelected?: boolean
    searchColorId?: string
}

export type ShowTextType={
    type?: 'titleText' | 'chapterTitle' | 'text'
    text: string
    isColored: boolean
}

export type ShowLineType={
    group:ShowTextType[]
    idLine?: string
}

export function isWordInHighlightLine(wordId: number, line: HighlightLine): boolean {
    return line.entireLine ||
        (line.startWord !== undefined && line.endWord !== undefined && line.startWord <= wordId && line.endWord >= wordId) ||
        (line.startWord !== undefined && line.endWord === undefined && line.startWord <= wordId) ||
        (line.startWord === undefined && line.endWord !== undefined && line.endWord >= wordId);
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

export function copyHighlightText({text,startWordId,endWordId}:{
    text:TextSchema,
    startWordId: number,
    endWordId: number
}): string {
    const selectedWords =
        text.flatMap(item => item.type === 'titleText' || item.type === 'chapterTitle' ? [] : (item as TextLineItem).text)
            .filter(w => w.ID >= startWordId && w.ID <= endWordId);
    return selectedWords.map(w => w.word).join(' ');
}

/**
 * <b>Warning</b>: do not use limitWord if textLine is too long, it will cause performance issue if the highlights is districate on many line
 */
export function showText({bound, textLines, limitWord = true}: {
    textLines: TextSchema,
    bound: HighlightBound
    limitWord?: boolean
}): ShowLineType[] {
    const result:ShowLineType[] = []
    let exitLoop = false
    if (bound != null) {
        let counter = 0
        textLines.forEach((line) => {
            if(exitLoop){
                return
            }
            const lineResult:ShowTextType[]=[]
            let textLine:string=''
            let textLineColor:string=''
            let lineID:string|undefined
            line.text.forEach((word) => {
                lineID = line.type === 'text' ? line.id : undefined
                if(word.ID === bound.startWord - 3){
                    textLine+="[...] "
                }else if ((word.ID >= bound.startWord - 2 && word.ID < bound.startWord) || (word.ID>bound.endWord && word.ID <= bound.endWord + 2)) {
                    textLine+=word.word + ' '
                    counter++
                }else if(word.ID >= bound.startWord && word.ID <= bound.endWord){
                    if(textLine.length>0){
                        lineResult.push({
                            type:line.type,
                            text: textLine,
                            isColored: false
                        })
                        textLine=''
                    }
                    textLineColor+=word.word + ' '
                    counter++
                }

                if(limitWord && counter>=LIMIT_PREVIEW_WORD){
                    exitLoop=true
                    return
                }
            })
            if(textLineColor.length>0){
                lineResult.push({
                    type:line.type,
                    text: textLineColor,
                    isColored: line.type === 'text'
                })
            }
            if(textLine.length>0){
                lineResult.push({
                    type:line.type,
                    text: textLine,
                    isColored: false
                })
            }
            if(lineResult.length>0)
                result.push({
                    group:lineResult,
                    idLine: lineID
                })
        })

    }
    const lenResult=result.length
    if(lenResult>0 && result[lenResult-1].group[result[lenResult-1].group.length-1].isColored || exitLoop){
        result[result.length-1].group[result[result.length-1].group.length-1].text+=' [...]'
    }
    return result
}

export function createGroup(
    paragraphWords: TextLineItem,
    startEndPosition: HighlightLine[],
    selectedRange: SelectionRange | HighlightLine,
    searchHighlight?: SearchHighlight,
) {
    const groups: WordGroup[] = []
    paragraphWords.text.forEach((word: Word) => {
        let isSelected = false;
        if (selectedRange) {
            if ('entireLine' in selectedRange) {
                isSelected = isWordInHighlightLine(word.ID, selectedRange as HighlightLine);
            } else {
                const r = selectedRange as NonNullable<SelectionRange>;
                isSelected = word.ID >= r.start && word.ID <= r.end;
            }
        }
        const searchColorId = searchHighlight && word.ID >= searchHighlight.start && word.ID <= searchHighlight.end
            ? searchHighlight.colorId
            : undefined;

        const highlightLine = startEndPosition.find((h) => isWordInHighlightLine(word.ID, h))
        const highlightId = highlightLine?.highlightId ?? '';

        const last = groups[groups.length - 1];
        if (groups.length !== 0 && last.highlightId === highlightId && last.isSelected === isSelected && last.searchColorId === searchColorId) {
            last.words.push(word);
        } else {
            groups.push({words: [word], highlightId, isSelected, searchColorId});
        }
    })
    return groups
}

export function composeTitle(text: Word[]) {
    return text.map(w => w.word).join(' ')
}

export function urlToPath(url: string | null, line: string | null | undefined): UrlPath | undefined {
    if (!url)
        return
    const spl=url.split(':')
    if (spl.length === 0)
        return
    return {
        path: spl[0],
        filename: spl[1],
        scrollLine: spl[2]
            ? Number(spl[2])
            : line
                ? Number(line)
                : 0
    }
}

export function normalizeChapter(chapter: TextBundle['chapter']): TextBundle['chapter'] {
    if (Array.isArray(chapter))
        return chapter
    return chapter ? [chapter] : []
}

export function resolveColorClass(group: WordGroup, colors: Record<string, string>): string {
    const isPreview = useHighlightStore(state => state.isPreview)
    const colorId = colors[group.highlightId]
    if (!colorId || !colorMap[colorId])
        return ''

    const colorClass = colorMap[colorId]
    return isPreview && group.highlightId!=='preview-highlight' ? colorClass.preview : colorClass.class
}

export function highlightRange({text,start,end,line}:{
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

export function findLineIdByWordId({text,wordId}:{text:TextIndexSchema,wordId:number}):number | null{
    return Number(Object.keys(text.content).find(key => {
        const line = text.content[Number(key)]
        return line.start <= wordId && line.end > wordId
    })) ?? null
}

export function getClosestWordIdx(event: React.PointerEvent<HTMLDivElement> | PointerEvent, lineDiv: HTMLElement | null): number | null {
    if (!lineDiv) return null;
    const spans = Array.from(lineDiv.querySelectorAll("span[data-word-id]")) as HTMLElement[];
    let closestSpanId: number | null = null;
    let minDistance = Infinity;
    for (const span of spans) {
        const rect = span.getBoundingClientRect();
        const dx = Math.max(rect.left - event.clientX, 0, event.clientX - rect.right);
        const dy = Math.max(rect.top - event.clientY, 0, event.clientY - rect.bottom);
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < minDistance) {
            minDistance = distance;
            closestSpanId = Number(span.dataset.wordId);
        }
    }
    if (minDistance <= 20) {
        return closestSpanId;
    }
    return null;
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

export function createTextConfig(url: UrlPath, id: number, textData: TextBundle, start: number | undefined, end: number | undefined, line: string) {
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

export function getSideHighlight(highlights: Record<string, HighlightDouble>, side: Side) {
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
