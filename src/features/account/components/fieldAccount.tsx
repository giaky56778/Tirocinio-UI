import {Field} from "@base-ui/react/field";
import {Separator} from "@base-ui/react/separator";
import type {FormValidationMode} from "@base-ui/react";
import React, {type JSX} from "react";
import {Form} from "@base-ui/react/form";

type Props ={
    name: string
    placeholder: string
    label: string
    validateMode: FormValidationMode
    validateFunction: ((value: unknown, formValues: Form.Values) => (string | string[] | void | Promise<string | string[] | void | null> | null)) | undefined
    icon: JSX.Element
    type: React.HTMLInputTypeAttribute
    actionsRef?:  React.RefObject<{ validate: () => void } | null>
    onChangeControl?: () => void
}

const FieldAccount = ({name, placeholder, label, type, validateFunction, icon, actionsRef, validateMode, onChangeControl}: Props) =>(
    <Field.Root
        name={name}
        className="flex flex-col gap-1.5 h-20"
        validationMode={validateMode}
        actionsRef={actionsRef}
        validate={validateFunction}
    >
        <Field.Label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            {label}
        </Field.Label>
        <div className="flex items-center gap-3 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus-within:ring-2 focus-within:ring-orange-600/20">
            {icon}
            <Separator
                orientation={"vertical"}
                className="h-5 w-px bg-slate-300"
            />
            <Field.Control
                type={type}
                onChange={onChangeControl}
                placeholder={placeholder}
                className="w-full text-sm text-slate-800 bg-transparent outline-none"
            />
        </div>
        <Field.Error className="text-xs text-red-600" />
    </Field.Root>
)

export default FieldAccount
