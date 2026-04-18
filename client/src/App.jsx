import { Component } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import WorkspacePage from "./pages/WorkspacePage";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center gap-4 p-8">
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 max-w-xl w-full">
            <h2 className="text-lg font-semibold text-red-400 mb-2">Something went wrong</h2>
            <p className="text-sm text-slate-300 mb-4">{this.state.error?.message}</p>
            <pre className="text-xs text-slate-500 bg-slate-900 rounded-lg p-3 overflow-auto max-h-40">
              {this.state.error?.stack}
            </pre>
            <button
              onClick={() => { this.setState({ error: null }); window.location.href = "/workspace"; }}
              className="mt-4 text-sm text-indigo-400 hover:text-indigo-300 border border-indigo-500/30 rounded-lg px-4 py-2 transition-colors cursor-pointer"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/workspace" element={<WorkspacePage />} />
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
