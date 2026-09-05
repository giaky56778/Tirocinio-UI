import {TextBundle, TextIndexSchema, TextLineItem, TextSchema, Word} from "@/api/indexType.ts";
import {HighlightBound} from "@/features/editor/reducer/wordHighlightReducer.ts";
import {LIMIT_PREVIEW_WORD} from "@/utils/settings.ts";

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
export function showText({bound, textLines, limitWord = true,hasMoreLine=false}: {
    textLines: TextSchema,
    bound: HighlightBound
    limitWord?: boolean
    hasMoreLine?: boolean
}): {
    result: ShowLineType[]
    firstLine: string
} {
    const result:ShowLineType[] = []
    let exitLoop = false
    let firstLine=''
    if (bound != null) {
        let counter = 0
        textLines.forEach((line) => {
            if(exitLoop)
                return

            const lineResult:ShowTextType[]=[]
            let textLine:string=''
            let textLineColor:string=''
            let lineID:string|undefined
            line.text.forEach((word) => {
                lineID = line.type === 'text' ? line.id : undefined
                if ((word.ID >= bound.startWord - 2 && word.ID < bound.startWord) || (word.ID>bound.endWord && word.ID <= bound.endWord + 2)) {
                    if(firstLine==='' && line.type === 'text')
                        firstLine = line.id
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
            if(textLineColor.length>0)
                lineResult.push({
                    type:line.type,
                    text: textLineColor,
                    isColored: line.type === 'text'
                })
            if(textLine.length>0)
                lineResult.push({
                    type:line.type,
                    text: textLine,
                    isColored: false
                })
            if(lineResult.length>0)
                result.push({
                    group:lineResult,
                    idLine: lineID
                })
        })

    }

    if (result.length > 0 && bound) {
        const firstGroup = result[0].group[0]
        if ((firstGroup.type === 'text') && bound.startWord > 2) {
            if (firstGroup.isColored) {
                result[0].group.unshift({ type: firstGroup.type, text: '[...] ', isColored: false })
            } else {
                firstGroup.text = "[...] " + firstGroup.text
            }
        }

        let isTextFinished = false
        if (textLines.length > 0) {
            const lastLine = textLines[textLines.length - 1]
            if (lastLine.text.length > 0) {
                const absoluteLastWordID = lastLine.text[lastLine.text.length - 1].ID
                if (bound.endWord + 2 >= absoluteLastWordID && !exitLoop) {
                    isTextFinished = true
                }
            }
        }

        if (!isTextFinished || hasMoreLine) {
            const lastLineResult = result[result.length - 1]
            const lastGroup = lastLineResult.group[lastLineResult.group.length - 1]
            lastGroup.text = lastGroup.text.trimEnd() + " [...]"
        }
    }

    return {
        result,
        firstLine
    }
}

export function normalizeChapter(chapter: TextBundle['chapter']): TextBundle['chapter'] {
    if (Array.isArray(chapter))
        return chapter
    return chapter ? [chapter] : []
}

export function findLineIdByWordId({text,wordId}:{text:TextIndexSchema,wordId:number}):number | null{
    return Number(Object.keys(text.content).find(key => {
        const line = text.content[Number(key)]
        return line.start <= wordId && line.end > wordId
    })) ?? null
}
