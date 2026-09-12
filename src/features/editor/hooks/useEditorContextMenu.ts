import {CostumeContextType,menuType} from "@/features/editor/components/editor/contextMenuCustom.tsx";
import {useCallback, useMemo, useState} from "react";

export default function useEditorContextMenu(): CostumeContextType {
    const [menuType, setMenuType] = useState<menuType>("default")
    const [highlightId, setHighlightId] = useState<string | null>(null)

    const toggleMenuType = useCallback((type: menuType, id?: string) => {
        setMenuType(type)
        setHighlightId(id != null ? id : null)
    }, [])

    return useMemo(() => ({
        menuType,
        highlightId,
        toggleMenuType
    }), [menuType, highlightId, toggleMenuType])
}
