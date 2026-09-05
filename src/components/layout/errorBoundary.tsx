import React from "react";
import ErrorVisualizer from "@/components/layout/errorVisualizer.tsx";

type Props = {
    children: React.ReactNode
    fallback?: React.ReactNode | ((error: Error) => React.ReactNode)
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

type State = {
    hasError: boolean
    error?: Error
}

export default class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = {
            hasError: false
        }
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error
        }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback !== undefined) {
                if (typeof this.props.fallback === 'function') {
                    return this.props.fallback(this.state.error!)
                }
                return this.props.fallback
            }
            return <ErrorVisualizer errorMessage={this.state.error!.message}/>
        }
        return this.props.children
    }
}
