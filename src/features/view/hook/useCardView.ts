import { showText } from "@/utils/commonUtil"
import type {highlightBiblicalType, highlightTextType} from "@/features/view/api/viewApi.ts";
import type {TextSelectedType} from "@/hook/useTextNameSelection.ts";
import type {TextListSchema} from "@/api/indexType.ts";
import {useGlobalState} from "@/store/globalStateStore.tsx";
import {useNavigate} from "react-router";
import {OFFSET_SCROLL} from "@/utils/settings.ts";

type Props={
    highlight: highlightBiblicalType
    selected: TextSelectedType | undefined
    highlightData: highlightTextType[]
    showPage: number
    biblicalNames:TextListSchema
}

export default function useCardView({highlight, selected, highlightData, showPage, biblicalNames}:Props) {
    const globalState=useGlobalState()
    const navigate=useNavigate()

    const {result:textB, firstLine: firstLineB} = showText({
        limitWord: false,
        textLines: highlight.historical_text,
        bound: {
            lineStart: 0,
            lineEnd: highlight.historical_text.length - 1,
            startWord: highlight.historical_range_word.startWord,
            endWord: highlight.historical_range_word.endWord
        },
        hasMoreLine: highlight.historical_more_line
    })
    const {result:textH, firstLine: firstLineH} = showText({
        limitWord: false,
        textLines: highlight.biblical_text,
        bound: {
            lineStart: 0,
            lineEnd: highlight.biblical_text.length - 1,
            startWord: highlight.biblical_range_word.startWord,
            endWord: highlight.biblical_range_word.endWord
        },
        hasMoreLine: highlight.biblical_more_line
    })

    function handleNavigateToHighlight() {
        if (!selected || !highlightData)
            return
        const page = highlightData[showPage]
        if (!page)
            return

        const biblicalGroup = biblicalNames.find(g => g.path === page.path)
        const biblicalItem = biblicalGroup?.items.find(i => i.filename === page.filename)
        const biblicalSelected = (biblicalGroup && biblicalItem)
            ? {
                path: biblicalGroup.path,
                items: biblicalItem
            } : {
                path: page.path,
                items: {
                    id: 0,
                    filename: page.filename
                }
            }

        globalState.setEditor({
            historical: selected,
            biblical: biblicalSelected,
            linePos: {
                historical: highlight.historical_start_line - OFFSET_SCROLL,
                biblical: highlight.biblical_start_line - OFFSET_SCROLL
            }
        })
        globalState.setView({
            text: selected,
            page: showPage
        })

        navigate('/')
    }

    return{
        historical:{
            text:textH,
            firstLine:firstLineH
        },
        biblical:{
            text:textB,
            firstLine:firstLineB
        },
        handleNavigateToHighlight
    }
}