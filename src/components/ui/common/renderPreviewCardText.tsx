import React from "react";
import {type ShowLineType} from "@/utils/commonUtil.ts";
import {colorMap, TEXT_FONT_CLASS, type TextType} from "@/utils/settings.ts";

export type RenderPreviewCardTextProps ={
    text: ShowLineType[],
    color?: string,
    side?: TextType
}

export default function RenderPreviewCardText({text, color,side}: RenderPreviewCardTextProps) {
    const colorClass = (color != null && colorMap[color] != null)
        ? colorMap[color].class
        : undefined

    return (
        <div className="px-4 py-3">
            <div className="h-36 overflow-y-auto rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm leading-relaxed text-gray-700 ">
                <div className="relative grid grid-cols-[0.5rem_minmax(0,1fr)] items-start gap-x-2 pl-1 pr-5" style={{fontSize: '1.0rem'}}>
                    {text.map((line, index) => (
                        <React.Fragment key={index}>
                            {line.idLine==undefined ?(
                                <b className="col-start-1 text-[0.65rem] text-right text-gray-600"/>
                            ) : (
                                <b className="col-start-1 text-[0.65rem] text-right text-gray-600">
                                    {line.idLine.split('_')[2] === '1' || index===0 ? `${line.idLine.split('_')[1]}` : ''}
                                </b>
                            )}
                            <span className="col-start-2 min-w-0">
                                {line.group.map(item => {
                                    if (item.type === "titleText")
                                        return (<h2 className="text-base font-normal my-1">{item.text}</h2>)
                                    if (item.type === "chapterTitle")
                                        return (<h3 className="text-sm font-bold my-1 text-gray-800">{item.text}</h3>)
                                    return (
                                        <span className={`${side === 'biblical' ? TEXT_FONT_CLASS : ''}`}>
                                            {item.isColored && colorClass != null ? (
                                                <span className={colorClass}>{item.text}</span>
                                            ) : (
                                                <span>{item.text}</span>
                                            )}
                                        </span>
                                    )
                                })}
                            </span>
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    )
}
