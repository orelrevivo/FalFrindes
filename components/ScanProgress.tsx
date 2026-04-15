interface ScanProgressProps {
  status: "idle" | "scanning" | "done" | "error";
  progress?: number;
}

export function ScanProgress({ status, progress = 0 }: ScanProgressProps) {
  if (status === "idle") return null;

  return (
    <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900">
      {status === "scanning" && (
        <div className="flex items-center gap-3">
          <div className="animate-spin w-5 h-5 border-2 border-[#7C3AED] border-t-transparent rounded-full"></div>
          <span className="text-zinc-600 dark:text-zinc-400">
            Scanning your social media profiles... {progress}%
          </span>
        </div>
      )}
      
      {status === "done" && (
        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Scan complete!</span>
        </div>
      )}
      
      {status === "error" && (
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span>Scan failed. Please try again.</span>
        </div>
      )}
    </div>
  );
}