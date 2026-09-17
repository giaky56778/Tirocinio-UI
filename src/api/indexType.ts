/**
* Text JSON Schema
*/
export type Word = {
    word: string;
    ID: number;
}
export type TitleTextItem ={
    type: "titleText";
    text: Word[];
}
export type ChapterTitleItem={
    type: "chapterTitle";
    text: Word[];
}
export type TextLineItem= {
    id: string
    type: "text"
    text: Word[]
}
export type TextItems = TitleTextItem | ChapterTitleItem | TextLineItem
export type TextSchema = TextItems[]

/**
 * Index of text JSON Schema
 */
export type VerseWordRange = {
    start: number
    end: number
}
export type VerseLineRange = {
    indexMax: number
    indexMin: number
    value: string
}


export type TextIndexSchema= {
    content: Record<number, VerseWordRange>
    maxIndex: number
}

export type ChapterIndexSchema = VerseLineRange[]

/**
 * List of text
 */
export type ContentItemText={
    id: number
    filename: string
}
export type TextListSchema = {
    path:string
    items:ContentItemText[]
}[]
export type TextBundle = {
    text: TextSchema
    index: TextIndexSchema
    chapter: ChapterIndexSchema
    textId: number
    startIndex?: number
}

/**
 * Highlight JSON Schema
 */
export type RangeHighlight={
    startLine?:number
    startWord: number
    endWord: number
}

/**
 * Me Schema
 */
export type MeSchema = {
    username: string
}

