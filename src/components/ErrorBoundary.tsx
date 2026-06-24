import React from 'react'

type State = {error: Error | null}

export default class ErrorBoundary extends React.Component<{}, State> {
  state: State = {error: null}

  static getDerivedStateFromError(error: Error) {
    return {error}
  }

  componentDidCatch(error: Error, info: any) {
    console.error('ErrorBoundary caught', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{padding:20}}>
          <h2>Something went wrong</h2>
          <pre style={{whiteSpace:'pre-wrap', background:'#111', color:'#fff', padding:12, borderRadius:8}}>{String(this.state.error && this.state.error.stack)}</pre>
        </div>
      )
    }
    return this.props.children as React.ReactElement
  }
}
