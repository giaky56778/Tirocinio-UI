import React from "react";
import {ToolBarType} from "@/features/editor/hooks/useEditorState.ts";
import { Toolbar } from "@base-ui/react";
import {ArrowTurnLeftIcon, CheckIcon} from "@/components/ui/icons";

const ToolBar = ({toolBar}: { toolBar: ToolBarType }) => (
    <div style={{display: toolBar.toolBarVisibile ? 'flex' : 'none'}} className="mb-2 w-full justify-center">
        <Toolbar.Root
            className="inline-flex items-center gap-1 p-1 bg-white rounded-xl border border-gray-200 shadow-lg"
            aria-label="Formatting options"
        >
            <Toolbar.Button
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 transition-all duration-100 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1"
                onClick={toolBar.save}
            >
                <CheckIcon className="w-3.5 h-3.5"/> Save
            </Toolbar.Button>
            <Toolbar.Button
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-800 active:scale-95 transition-all duration-100 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-1"
                onClick={toolBar.restore}
            >
                <ArrowTurnLeftIcon className="w-3.5 h-3.5"/> Restore
            </Toolbar.Button>
        </Toolbar.Root>
    </div>
)

export default React.memo(ToolBar)
